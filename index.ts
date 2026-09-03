import type { Token } from "typescript/unstable/ast";

const URL = "https://sic.internetude.fr/Api/";

type KinouGardeApiScope = "KinougardeIntervenant";

const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
  "sec-ch-ua": '"Chromium";v="151", "Not=A?Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  Referer: "https://intervenant.kinougarde.com/",
};

type FormValue = string | number | boolean;

export function toFormUrlEncoded<T extends object>(data: {
  [K in keyof T]: FormValue;
}): string {
  const params = new URLSearchParams();

  for (const key in data) {
    params.append(key, String(data[key]));
  }

  return params.toString();
}

type PostParam<T extends object = {}> = {
  path: string;
  body?: T;
};

type TokenAuth = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  ".issued": string;
  ".expires": string;
};

class KinouGardeClient {
  currentScope: KinouGardeApiScope = "KinougardeIntervenant";
  token: TokenAuth | null = null;

  async connect(username: string, password: string) {
    const result = await this.post<TokenAuth>({
      path: "TokenAuth",
      body: {
        username,
        password,
        grant_type: "password",
      },
    });

    this.token = result;

    return result;
  }

  scope(value: KinouGardeApiScope): KinouGardeClient {
    this.currentScope = value;
    return this;
  }

  async post<Return>(params: PostParam) {
    const result = await fetch(
      "https://sic.internetude.fr/Api/KinougardeIntervenant/TokenAuth",
      {
        headers: DEFAULT_HEADERS,
        body: params.body ? toFormUrlEncoded(params.body) : undefined,
        method: "POST",
      },
    );

    return (await result.json()) as Return;
  }
}
