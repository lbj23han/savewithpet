# SaveWithPet 운영 점검 SQL

출시 후 결제, AI 생성, 광고 보상 흐름이 어긋났는지 빠르게 확인하기 위한 Supabase SQL 모음입니다.

## 결제-생성권 점검

유료 결제는 완료됐지만 생성권 지급 여부를 다시 확인해야 하는 후보입니다.

```sql
select
  p.id,
  p.user_id,
  p.product_type,
  p.product_id,
  p.price_krw,
  p.status,
  p.provider,
  p.provider_order_id,
  p.provider_payment_id,
  p.created_at,
  pr.ai_character_credits
from public.purchases p
join public.profiles pr on pr.id = p.user_id
where p.product_type in ('ai_character', 'ai_character_pack')
  and p.status = 'paid'
order by p.created_at desc
limit 100;
```

중복 order id가 생기면 안 됩니다.

```sql
select
  provider,
  provider_order_id,
  count(*) as duplicated_count
from public.purchases
where provider_order_id is not null
group by provider, provider_order_id
having count(*) > 1;
```

## AI 생성 job 점검

최근 실패한 AI 생성 job입니다. 실패 후 생성권 환불 여부는 `profiles.ai_character_credits`와 사용자 문의 내역을 같이 확인합니다.

```sql
select
  id,
  user_id,
  purchase_id,
  status,
  error_message,
  created_at,
  updated_at
from public.ai_character_jobs
where status = 'failed'
order by updated_at desc
limit 100;
```

성공했지만 결과 이미지나 pet 연결이 비어 있는 후보입니다.

```sql
select
  id,
  user_id,
  status,
  result_image_url,
  result_pet_id,
  created_at,
  updated_at
from public.ai_character_jobs
where status = 'succeeded'
  and (result_image_url is null or result_pet_id is null)
order by updated_at desc
limit 100;
```

## 리워드 광고 보상 점검

하루 5회 제한을 넘는 후보입니다. 현재 앱은 클라이언트에서 30분 쿨타임과 일 5회 제한을 적용합니다. 서버 RPC 방식으로 전환하기 전까지는 이 쿼리로 이상치를 확인합니다.

```sql
select
  user_id,
  date_trunc('day', created_at at time zone 'Asia/Seoul') as reward_day,
  count(*) as reward_count,
  sum(coins) as total_coins
from public.reward_events
where label = '영상 광고 보상'
group by user_id, reward_day
having count(*) > 5
order by reward_day desc, reward_count desc;
```

짧은 시간에 반복 지급된 후보입니다.

```sql
with reward_ads as (
  select
    user_id,
    created_at,
    lag(created_at) over (partition by user_id order by created_at) as previous_created_at
  from public.reward_events
  where label = '영상 광고 보상'
)
select
  user_id,
  previous_created_at,
  created_at,
  extract(epoch from (created_at - previous_created_at)) / 60 as minutes_between
from reward_ads
where previous_created_at is not null
  and created_at - previous_created_at < interval '30 minutes'
order by created_at desc
limit 100;
```
