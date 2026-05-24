import fs from "node:fs";
import https from "node:https";

const TOSS_API_HOST = "apps-in-toss-api.toss.im";
const AUTH_PATH = "/api-partner/v1/apps-in-toss/user/oauth2";

let cachedCert = null;
let cachedKey = null;

function normalizePem(value) {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function readMtlsValue(inlineEnvNames, base64EnvNames, pathEnvName) {
  const inlineValue = inlineEnvNames.map((name) => process.env[name]).find(Boolean);
  if (inlineValue) return normalizePem(inlineValue);

  const base64Value = base64EnvNames.map((name) => process.env[name]).find(Boolean);
  if (base64Value) return Buffer.from(base64Value, "base64").toString("utf8");

  const filePath = process.env[pathEnvName];
  if (filePath) return fs.readFileSync(filePath);

  throw new Error(`missing_mtls_credential:${inlineEnvNames[0]}_or_${pathEnvName}`);
}

function getMtlsCredentials() {
  if (!cachedCert) {
    cachedCert = readMtlsValue(
      ["TOSS_MTLS_CERT", "TOSS_CLIENT_CERT"],
      ["TOSS_MTLS_CERT_BASE64", "TOSS_CLIENT_CERT_BASE64"],
      "MTLS_CERT_PATH",
    );
  }
  if (!cachedKey) {
    cachedKey = readMtlsValue(
      ["TOSS_MTLS_KEY", "TOSS_CLIENT_KEY", "TOSS_PRIVATE_KEY"],
      ["TOSS_MTLS_KEY_BASE64", "TOSS_CLIENT_KEY_BASE64", "TOSS_PRIVATE_KEY_BASE64"],
      "MTLS_KEY_PATH",
    );
  }
  return { cert: cachedCert, key: cachedKey };
}

function tossRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const { cert, key } = getMtlsCredentials();

    const options = {
      hostname: TOSS_API_HOST,
      port: 443,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        ...headers,
      },
      cert,
      key,
      rejectUnauthorized: true,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`toss_api_${res.statusCode}: ${text}`));
          return;
        }
        try {
          resolve(JSON.parse(text));
        } catch {
          reject(new Error(`toss_api_invalid_json: ${text}`));
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

export const tossClient = {
  generateToken(authorizationCode, referrer) {
    return tossRequest("POST", `${AUTH_PATH}/generate-token`, {
      authorizationCode,
      referrer,
    });
  },

  refreshToken(refreshToken) {
    return tossRequest("POST", `${AUTH_PATH}/refresh-token`, { refreshToken });
  },

  getMe(accessToken) {
    return tossRequest("GET", `${AUTH_PATH}/login-me`, undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
  },

  removeByAccessToken(accessToken) {
    return tossRequest("POST", `${AUTH_PATH}/access/remove-by-access-token`, undefined, {
      Authorization: `Bearer ${accessToken}`,
    });
  },
};
