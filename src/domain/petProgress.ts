import type { PetStatus } from "../types/app";

export type PetStatusViewModel = PetStatus & {
  percentLabel: string;
  isHealthy: boolean;
};

class PetProgressStatus {
  constructor(private readonly status: PetStatus) {}

  toViewModel(): PetStatusViewModel {
    return {
      ...this.status,
      percentLabel: `${this.status.value}%`,
      isHealthy: this.status.value >= 70,
    };
  }
}

export function createPetStatusViewModels(statuses: PetStatus[]): PetStatusViewModel[] {
  return statuses.map((status) => new PetProgressStatus(status).toViewModel());
}

export function createPetStatuses({
  fullness,
  mood,
  growth,
}: {
  fullness: number;
  mood: number;
  growth: number;
}): PetStatus[] {
  return [
    { label: "포만도", value: fullness, tone: "orange" },
    { label: "기분", value: mood, tone: "purple" },
    { label: "성장", value: growth, tone: "green" },
  ];
}
