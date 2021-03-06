/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import { seriesDB } from '../api/movieDB';
import { AuthContext } from '../context/AuthContext';
import { Providers, SeriesCast, SeriesCredits, SeriesFull, SeriesSeason, Video, VideosResponse } from '../interfaces/movieInterface';

interface SeriesDetails {
    isLoading: boolean;
    serieFull?: SeriesFull;
    cast: SeriesCast[];
    providers: Providers[];
    videos: Video[]
    seasons: SeriesSeason[];
}

export const useSeriesDetail = ( serieId: number, userRegion: string | undefined ) => {

    const [state, setState] = useState<SeriesDetails>({
        isLoading: true,
        serieFull: undefined,
        cast: [],
        providers: [],
        videos: [],
        seasons: [],
    });

    const { user } = useContext( AuthContext )

    const getSeriesDetail = async () => {

        const lenguageParams = {
            language: user?.settings.leng || 'en-US',
        }

        const serieDetailsPromise = seriesDB.get<SeriesFull>(`/${serieId}`, { params: lenguageParams });
        const castPromise = seriesDB.get<SeriesCredits>(`/${serieId}/credits`);
        const providersPromise = seriesDB.get(`/${serieId}/watch/providers`);
        const videosPromise = seriesDB.get<VideosResponse>(`/${serieId}/videos`);

        const [serieDetailsResponse, castResponse, providersResponse, videosResponse] = await Promise.all([serieDetailsPromise, castPromise, providersPromise, videosPromise]);

        const seasonsTotal = serieDetailsResponse.data.seasons.map(season => season.season_number).sort((a, b) => a - b).pop();

        let seasonsArray: SeriesSeason[] = [];

        if ( seasonsTotal ) {

            for (let i = 1; i <= seasonsTotal; i++) {
                const seasonPromise = seriesDB.get<SeriesSeason>(`/${serieId}/season/${i}`);
    
                const seasonResponse = await seasonPromise;
    
                seasonsArray = [...seasonsArray, seasonResponse.data];
            }
           
        }

        let userRegionProviders

        if ( userRegion ) {
            userRegionProviders = providersResponse.data.results.hasOwnProperty(userRegion) ? providersResponse.data.results[userRegion] : providersResponse.data.results.US;
        } else {
            userRegionProviders = providersResponse.data.results.US;
        }

        setState({
            isLoading: false,
            serieFull: serieDetailsResponse.data,
            cast: castResponse.data.cast,
            providers: userRegionProviders?.flatrate ? userRegionProviders.flatrate : [],
            videos: videosResponse.data.results || [],
            seasons: seasonsArray,
        });
    };

    useEffect(() => {
        getSeriesDetail();
    }, []);

    return {
        ...state,
    };
};

