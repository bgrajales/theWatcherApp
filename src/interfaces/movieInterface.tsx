// Get movies categories

export interface MovieDBMoviesResponse {
    dates?:         Dates;
    page:          number;
    results:       Movie[];
    total_pages:   number;
    total_results: number;
}

export interface Dates {
    maximum: string;
    minimum: string;
}

export interface Movie {
    adult:             boolean;
    backdrop_path:     string;
    genre_ids:         number[];
    id:                number;
    original_language: OriginalLanguage;
    original_title:    string;
    overview:          string;
    popularity:        number;
    poster_path:       string;
    release_date:      string;
    title:             string;
    video:             boolean;
    vote_average:      number;
    vote_count:        number;
}

// Movie by ID details

export interface MovieFull {
    adult:                 boolean;
    backdrop_path:         string;
    belongs_to_collection: null;
    budget:                number;
    genres:                Genre[];
    homepage:              string;
    id:                    number;
    imdb_id:               string;
    original_language:     string;
    original_title:        string;
    overview:              string;
    popularity:            number;
    poster_path:           string;
    production_companies:  ProductionCompany[];
    production_countries:  ProductionCountry[];
    release_date:          string;
    revenue:               number;
    runtime:               number;
    spoken_languages:      SpokenLanguage[];
    status:                string;
    tagline:               string;
    title:                 string;
    video:                 boolean;
    vote_average:          number;
    vote_count:            number;
}

export interface ProductionCompany {
    id:             number;
    logo_path:      string;
    name:           string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name:       string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1:    string;
    name:         string;
}

export interface MovieCreditsResponse {
    id:   number;
    cast: MovieCast[];
    crew: MovieCast[];
}

export interface MovieCast {
    adult:                boolean;
    gender:               number;
    id:                   number;
    known_for_department: string;
    name:                 string;
    original_name:        string;
    popularity:           number;
    profile_path:         null | string;
    cast_id?:             number;
    character?:           string;
    credit_id:            string;
    order?:               number;
    department?:          string;
    job?:                 string;
}

// Generated by https://quicktype.io

export interface VideosResponse {
    id:      number;
    results: Video[];
}

export interface Video {
    iso_639_1:    string;
    iso_3166_1:   string;
    name:         string;
    key:          string;
    site:         string;
    size:         number;
    type:         string;
    official:     boolean;
    published_at: string;
    id:           string;
}


// Generated by https://quicktype.io

export interface MovieDBSeriesResponse {
    page:          number;
    results:       Series[];
    total_pages:   number;
    total_results: number;
}

export interface Series {
    backdrop_path:     string;
    first_air_date:    string;
    genre_ids:         number[];
    id:                number;
    name:              string;
    origin_country:    string[];
    original_language: string;
    original_name:     string;
    overview:          string;
    popularity:        number;
    poster_path:       string;
    vote_average:      number;
    vote_count:        number;
}

export interface SeriesFull {
    adult:                boolean;
    backdrop_path:        null;
    created_by:           any[];
    episode_run_time:     number[];
    first_air_date:       string;
    genres:               Genre[];
    homepage:             string;
    id:                   number;
    in_production:        boolean;
    languages:            string[];
    last_air_date:        string;
    last_episode_to_air:  LastEpisodeToAir;
    name:                 string;
    next_episode_to_air:  null;
    networks:             Network[];
    number_of_episodes:   number;
    number_of_seasons:    number;
    origin_country:       string[];
    original_language:    string;
    original_name:        string;
    overview:             string;
    popularity:           number;
    poster_path:          null;
    production_companies: any[];
    production_countries: any[];
    seasons:              Season[];
    spoken_languages:     SpokenLanguage[];
    status:               string;
    tagline:              string;
    type:                 string;
    vote_average:         number;
    vote_count:           number;
}

export interface Genre {
    id:   number;
    name: string;
}

export interface LastEpisodeToAir {
    air_date:        string;
    episode_number:  number;
    id:              number;
    name:            string;
    overview:        string;
    production_code: string;
    season_number:   number;
    still_path:      null;
    vote_average:    number;
    vote_count:      number;
}

export interface Network {
    name:           string;
    id:             number;
    logo_path:      string;
    origin_country: string;
}

export interface Season {
    air_date:      string;
    episode_count: number;
    id:            number;
    name:          string;
    overview:      string;
    poster_path:   null;
    season_number: number;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1:    string;
    name:         string;
}

export interface SeriesCredits {
    cast: SeriesCast[];
    crew: SeriesCast[];
    id:   number;
}

export interface SeriesCast {
    adult:                boolean;
    gender:               number;
    id:                   number;
    known_for_department: KnownForDepartment;
    name:                 string;
    original_name:        string;
    popularity:           number;
    profile_path:         null | string;
    character?:           string;
    credit_id:            string;
    order?:               number;
    department?:          string;
    job?:                 string;
}

export enum KnownForDepartment {
    Acting = "Acting",
    Writing = "Writing",
}

// Generated by https://quicktype.io

export interface Providers {
    display_priority: number;
    logo_path:        string;
    provider_id:      number;
    provider_name:    string;
}

// Generated by https://quicktype.io

export interface SeriesSeason {
    _id:           string;
    air_date:      string;
    episodes:      Episode[];
    name:          string;
    overview:      string;
    id:            number;
    poster_path:   null;
    season_number: number;
}

export interface Episode {
    air_date:        string;
    episode_number:  number;
    crew:            any[];
    guest_stars:     any[];
    id:              number;
    name:            string;
    overview:        string;
    production_code: string;
    season_number:   number;
    still_path:      null;
    vote_average:    number;
    vote_count:      number;
}

// Generated by https://quicktype.io

export interface SearchResponse {
    page:          number;
    results:       SearchIndiv[];
    total_pages:   number;
    total_results: number;
}

export interface SearchIndiv {
    adult?:                boolean;
    backdrop_path?:        null | string;
    genre_ids?:            number[];
    id:                    number;
    media_type:            MediaType;
    original_language?:    OriginalLanguage;
    original_title?:       string;
    overview?:             string;
    popularity?:           number;
    poster_path?:          null | string;
    release_date?:         string;
    title?:                string;
    video?:                boolean;
    vote_average?:         number;
    vote_count?:           number;
    first_air_date?:       string;
    name?:                 string;
    origin_country?:       string[];
    original_name?:        string;
    gender?:               number;
    known_for_department?: string;
    profile_path?:         null | string;
}

export enum MediaType {
    Movie = "movie",
    Person = "person",
    Tv = "tv",
}

export enum OriginalLanguage {
    CS = "cs",
    En = "en",
    Es = "es",
    Nl = "nl",
}

export interface UserMovies {
    id: string;
    posterPath: string;
    runTime: number;
}

export interface UserSeries {
    id: string;
    posterPath: string;
    episodesTotal: number;
    episodesWatched: number;
    seasonsDetail: SeasonDetailSeries[];
}

export interface SeasonDetailSeries {
    id: string;
    number: number;
    episodes: [number];
}

