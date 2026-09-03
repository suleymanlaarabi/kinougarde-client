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

export type TokenAuth = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  ".issued": string;
  ".expires": string;
};

export type Adress = {
  IdCommuneAcceptee: number;
  CodeNatureComacc: number;
  AdresseContrat: true;
  DateDerniereRecherche: string;
  Id: number;
  Ligne1: string;
  Ligne2: string | null;
  Ligne3: string | null;
  CodePostal: string;
  Ville: string;
  IdCommune: number;
  Commune: null;
  CodeZoneVacances: null;
  Pays: string;
  CodeInsee: null;
  GeocodeAdresse: string;
  Latitude: number;
  Longitude: number;
  GeocodeDateMaj: string;
};

type JobSearchResponse = {
  Filtres: SearchFilters;
  AgeMin: number;
  AgeMax: number;
  NbEnfantMax: number;
  ChoixLangue: boolean;
  MapBox: MapBounds;
  Demandes: JobRequest[];
};

type SearchFilters = {
  NbHeureMin: number | null;
  AfficheNonCompatible: boolean;
  NbEnfant: number | null;
  AgeMin: number;
  AgeMax: number;
  Langue: number;
};

type MapBounds = {
  IdSessionRecherche: number;
  NordOuestLatitude: number;
  NordOuestLongitude: number;
  SudEstLatitude: number;
  SudEstLongitude: number;
};

type JobRequest = {
  IdDemandeGeDrCalculSbloc: number;
  Ville: string;
  DistanceKm: string;
  TypeGarde: string;
  ResumePeriode: string;

  CategorieAction: number;
  InfoProposition: number;

  PrixUnitaire: string;
  TotalPrix: string;

  AdequatLundi: boolean;
  AdequatMardi: boolean;
  AdequatMercredi: boolean;
  AdequatJeudi: boolean;
  AdequatVendredi: boolean;
  AdequatSamedi: boolean;

  Chien: boolean | null;
  Chat: boolean | null;

  Permis: boolean | null;
  Vehicule: boolean | null;

  DateParutionLibelle: string;

  EstOffreAffectable: boolean;
  EstIncompatible: boolean;
  HasAction: boolean;
  HasProposition: boolean;

  Latitude: number;
  Longitude: number;

  DejaConsulte: boolean;
  DateParution: string;

  EnfantsPrenom: string[];

  APeriodeVacances: boolean;

  NbHeuresParSemaine: number;
  NbEnfants: number;

  AgeMin: number;
  AgeMax: number;

  NbDistanceKm: number;
  IdDemande: number;

  Enfants: string;
  HeureParSemaine: string;

  EstOffreMomji: boolean;
  EstGardeAnglais: boolean;

  I18nCodeModePeriodeScolaire: number;
  I18nDateParution: string;
  I18nDistanceKm: number;
  I18nPrixUnitaire: string;
  I18nTotalPrix: string;
  I18nPeriode: string;
  I18nNatureGarde: string | null;
};

type SearchJobsParams = {
  SessionRecherche: SearchSession;
  MapBox: MapBounds;
};

type SearchSession = {
  AvecChat: boolean;
  AvecChien: boolean;
  AvecPermis: boolean;
  DateDebut: string;
  DateFin: string;
  Id: number;
  IdAdresse: number;
  Disponibilite: Availability;
  DispoPeriode: number;
  AvecVehicule: boolean;
};

type Availability = {
  LundiAmDebut: number;
  LundiAmFin: number;
  LundiPmDebut: number;
  LundiPmFin: number;

  MardiAmDebut: number;
  MardiAmFin: number;
  MardiPmDebut: number;
  MardiPmFin: number;

  MercrediAmDebut: number;
  MercrediAmFin: number;
  MercrediPmDebut: number;
  MercrediPmFin: number;

  JeudiAmDebut: number;
  JeudiAmFin: number;
  JeudiPmDebut: number;
  JeudiPmFin: number;

  VendrediAmDebut: number;
  VendrediAmFin: number;
  VendrediPmDebut: number;
  VendrediPmFin: number;

  SamediAmDebut: number;
  SamediAmFin: number;
  SamediPmDebut: number;
  SamediPmFin: number;
};

export class KinouGardeClient {
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

  async adresses(): Promise<Adress[]> {
    return await this.get<Adress[]>({
      path: "V2/intervenant/adresses",
    });
  }

  async jobs(params: SearchJobsParams): Promise<JobSearchResponse> {
    return await this.post({
      path: "V2/gap/v3/search",
      body: JSON.stringify(params),
    });
  }

  scope(value: KinouGardeApiScope): KinouGardeClient {
    this.currentScope = value;
    return this;
  }

  headers(): HeadersInit {
    return {
      ...DEFAULT_HEADERS,
      authorization: `Bearer ${this.token?.access_token}`,
    };
  }

  async request({
    path,
    body,
    method,
  }: {
    path: string;
    method: RequestInit["method"];
    body?: object;
  }): Promise<Response> {
    return await fetch(`${URL}${this.currentScope}/${path}`, {
      headers: this.headers(),
      body: body
        ? typeof body == "string"
          ? body
          : toFormUrlEncoded(body)
        : undefined,
      method,
    });
  }

  async post<Return>(params: PostParam) {
    const result = await this.request({
      path: params.path,
      method: "POST",
      body: params.body,
    });

    return (await result.json()) as Return;
  }

  async get<Return>(params: PostParam) {
    const result = await this.request({
      path: params.path,
      method: "GET",
      body: params.body,
    });

    return (await result.json()) as Return;
  }
}
