import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/Ionicons'
import StarRating from 'react-native-star-rating';
import { getEpisodeData } from '../api/TMDBActions';
import { Comments, EpisodeModalResponse } from '../interfaces/movieInterface';
import { BlurView } from 'expo-blur';
import { likeComment, postComment, postReply } from '../api/watcherActions';
import { AuthContext } from '../context/AuthContext';
import { english } from '../lenguages/english';
import { spanish } from '../lenguages/spanish';


interface Props {
    visible: boolean,
    setVisible: (visible: boolean) => void,
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
}

export const EpisodeModal = ({ visible = false, setVisible, seriesId, seasonNumber, episodeNumber }: Props) => {
  
    const { user, updateLikedComments, colorScheme } = useContext( AuthContext )

    const [isVisible, setIsVisible] = useState(visible);
    const [ writeCommentVisible, setWriteCommentVisible ] = useState(false);
    const [ commentToPost, setCommentToPost ] = useState<string>('');

    const [ showReplies, setShowReplies ] = useState(false);
    const [ commentToShow, setCommentToShow ] = useState<Comments>({} as Comments);

    const [ replyText, setReplyText] = useState('');

    const [ fullEpisode, setFullEpisode ] = useState<EpisodeModalResponse>();

    useEffect(() => {
        setIsVisible(visible);

        if( visible ) {
            modalStart();
        }

    }, [visible])

    const closeModal = () => {
        setIsVisible(false);
        setVisible(false);

        setFullEpisode(undefined);
    }

    const modalStart = async () => {
        
        const resp = await getEpisodeData({ serieId: seriesId, seasonNumber, episodeNumber }, user?.settings.leng || 'en-US');
        
        if ( resp ) {
            setFullEpisode(resp);
            console.log(resp)
            console.log(resp.air_date > new Date().toISOString().split('T')[0])
        } else {
            setFullEpisode(undefined);
        }

    }

    const postCommentBtnAction = async () => {

        const userName = user!.userName

        if ( commentToPost.length > 3 ) {

            const resp = await postComment({ userName, comment: commentToPost, elementId: fullEpisode!.id, type: 'series' });

            if ( resp.result && fullEpisode ) {

                const commentMade: Comments = {
                    userName,
                    comment: commentToPost,
                    date: new Date().toLocaleString(),
                    likes: 0,
                    replies: [],
                    id: Math.floor(Math.random() * 1000000).toString()
                }
                
                const commentsNew: Comments[] = [ commentMade, ...fullEpisode!.comments ];

                setFullEpisode({
                    ...fullEpisode,
                    comments: commentsNew
                })

                setWriteCommentVisible(false);
                setCommentToPost('');

            }
        
        }
    }

    const likeCommentAction = async (commentId: string, commentUserName: string) => {

        if ( !user ) return;

        if (commentUserName === user?.userName) {
            return;
        }

        const resp = await likeComment({ userName: user!.userName, commentId, elementId: fullEpisode!.id })

        if ( resp.result && fullEpisode ) {

            const comments = fullEpisode!.comments.map( (comment: Comments) => {
                if ( comment.id === commentId ) {
                    return {
                        ...comment,
                        likes: resp.action === 'like' ? comment.likes + 1 : comment.likes - 1
                    }
                } else {
                    return comment;
                }
            })

            setFullEpisode({
                ...fullEpisode,
                comments
            })

            let newLikedComments

            if ( resp.action === 'like' ) {
                newLikedComments = [ ...user!.likedComments, commentId ]    
            } else {
                newLikedComments = user!.likedComments.filter( (commentId: string) => commentId !== commentId )
            }

            updateLikedComments(newLikedComments)
            
        }
        
    }

    const replyCommentAction = async (commentId: string) => {

        if ( replyText.length > 3 ) {

            const resp = await postReply({ userName: user!.userName, reply: replyText, commentId, elementId: fullEpisode!.id})

            if ( resp.result && fullEpisode ) {

                const newCommentShow = {
                    ...commentToShow,
                    replies: [ ...commentToShow.replies, {
                        userName: user!.userName,
                        comment: replyText,
                        date: new Date().toLocaleDateString(),
                        likes: 0,
                        id: Math.floor(Math.random() * 1000000).toString()
                    }]
                }

                const commentsArr = fullEpisode!.comments.map( (comment: Comments) => {
                    if ( comment.id === commentId ) {
                        return newCommentShow;
                    } else {
                        return comment;
                    }
                })

                setFullEpisode({
                    ...fullEpisode,
                    comments: commentsArr
                })
                setCommentToShow(newCommentShow);

                setReplyText('');
                setWriteCommentVisible(false);

            }

        }

    }

    const showRepliesFunction = (comment: Comments) => {

        setShowReplies(true);
        setCommentToShow(comment);

    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            style={{
                position: 'relative',
                zIndex: 1,
            }}
        >
            
            <View style={{ 
                ...styles.closeSection,
                backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff'    
            }}>
                <Icon style={{ ...styles.iconClose }}name="md-close" size={30} color={
                    colorScheme === 'dark' ? '#fff' : '#000'
                } onPress={() => closeModal()} />
            </View>

                
            <View
                style={{ 
                    ...styles.modal, 
                    backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff'
                }}
            >
                    {
                        fullEpisode ? (
                                
                            <ScrollView
                                contentContainerStyle={{
                                    overflow: 'visible',
                                    paddingHorizontal: 20,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                            <View style={{ paddingTop: 20 }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500${fullEpisode.still_path}` }} style={{ width: 80, height: 80, borderRadius: 10, marginRight: 10 }} />
                                    <View>
                                        <Text style={{ 
                                            ...styles.title,
                                            color: colorScheme === 'dark' ? '#fff' : '#000'
                                        }}>{ fullEpisode.name }</Text>
                                        <Text style={ styles.text }>
                                            {/* {english.episodeModalSeason} { seasonNumber } - {english.episodeModalEpisode} { episodeNumber } */}
                                            {
                                                user?.settings.leng === 'es-ES' ? spanish.episodeModalSeason : english.episodeModalSeason
                                            } { seasonNumber } - {
                                                user?.settings.leng === 'es-ES' ? spanish.episodeModalEpisode : english.episodeModalEpisode
                                            } { episodeNumber }
                                        </Text>
                                        <View
                                            style={{ 
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: 2,
                                            }}
                                        >
                                            <StarRating
                                                disabled={ true }
                                                maxStars={ 5 }
                                                rating={ fullEpisode.vote_average / 2 }
                                                starSize={ 20 }
                                                fullStarColor={ '#FFD700' }
                                                emptyStarColor={ '#FFD700' }
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {
                                fullEpisode.air_date && fullEpisode.air_date > new Date().toISOString().split('T')[0] ? (
                                    <View style={{ 
                                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Image 
                                            source={ require('../assets/empty.png') }
                                            style={{
                                                marginTop: 30,
                                            }}
                                        />
                                        <Text style={{ 
                                            color: colorScheme === 'dark' ? '#fff' : '#000', 
                                            fontSize: 18,
                                            fontWeight: 'bold',
                                            marginTop: 20,
                                        }}>
                                            {
                                                user?.settings.leng === 'es-ES' ? spanish.episodeModalNotAired : english.episodeModalNotAired
                                            }
                                        </Text>
                                        <Text
                                            style={{
                                                color: colorScheme === 'dark' ? '#fff' : '#000',
                                                fontSize: 16,
                                                marginTop: 10,
                                            }}
                                        >
                                            {
                                                user?.settings.leng === 'es-ES' ? spanish.episodeModalNotAired2 : english.episodeModalNotAired2
                                            }
                                        </Text>
                                        <Text
                                            style={{
                                                color: colorScheme === 'dark' ? '#fff' : '#000',
                                                fontSize: 18,
                                                marginTop: 10,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {
                                                fullEpisode.air_date.split('-')[2]
                                            }/{
                                                fullEpisode.air_date.split('-')[1]
                                            }/{
                                                fullEpisode.air_date.split('-')[0]
                                            }
                                        </Text>
                                    </View>
                                ) : (
                                <>
                                    {
                                        fullEpisode.overview ? (
                                            <View>
                                                <View style={ styles.subTitleDiv }>
                                                    <Text style={{ 
                                                        ...styles.subTitle,
                                                        color: colorScheme === 'dark' ? '#fff' : '#000'
                                                    }}>
                                                        {
                                                            user?.settings.leng === 'es-ES' ? spanish.lengOverview : english.lengOverview
                                                        } 
                                                    </Text>
                                                    <Icon name="eye" color={
                                                        colorScheme === 'dark' ? '#fff' : '#000'
                                                    } size={20} style={{ marginLeft: 10 }} />
                                                </View>
                                                <Text style={ styles.text }>{ fullEpisode.overview }</Text>
                                            </View>
                                        ) : null
                                    }

                                    {
                                        fullEpisode.stills && fullEpisode.stills.length > 0 ? (
                                            <View
                                                style={{
                                                    marginLeft: -20,
                                                    marginBottom: 20,
                                                }}
                                            >
                                                <View style={{ ...styles.subTitleDiv, marginLeft: 20, marginBottom: 20 }}>
                                                    <Text style={{ 
                                                        ...styles.subTitle,
                                                        color: colorScheme === 'dark' ? '#fff' : '#000'
                                                    }}>
                                                        {
                                                            user?.settings.leng === 'es-ES' ? spanish.episodeModalStills : english.episodeModalStills
                                                        }
                                                    </Text>
                                                    <Icon name="image" color={
                                                        colorScheme === 'dark' ? '#fff' : '#000'
                                                    } size={20} style={{ marginLeft: 10 }} />
                                                </View>
                                                <Carousel
                                                    data={ fullEpisode.stills }
                                                    renderItem={({ item }: any) => (
                                                        <Image
                                                            source={{ uri: `https://image.tmdb.org/t/p/w500${item.file_path}` }}
                                                            style={{ width: 300, height: 169, borderRadius: 10 }}
                                                        />
                                                    )}
                                                    sliderWidth={ Dimensions.get('window').width }
                                                    itemWidth={ 300 }
                                                    inactiveSlideScale={ 0.95 }
                                                    inactiveSlideOpacity={ 0.7 }
                                                    enableMomentum={ true }
                                                />
                                            </View>
                                        ) : null
                                    }
                                    
                                    <View>
                                        <View style={ styles.subTitleDiv }>
                                            <Text style={{ 
                                                ...styles.subTitle,
                                                color: colorScheme === 'dark' ? '#fff' : '#000'
                                            }}>
                                                {
                                                    user?.settings.leng === 'es-ES' ? spanish.episodeModalComments : english.episodeModalComments
                                                }
                                            </Text>
                                            <Icon name="chatbubbles" color={
                                                colorScheme === 'dark' ? '#fff' : '#000'
                                            } size={20} style={{ marginLeft: 10 }} />
                                        </View>
                                        <View>
                                            {
                                                user ? (
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: '#0055FF',
                                                        padding: 10,
                                                        borderRadius: 10,
                                                        marginBottom: 10,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        marginTop: 10,
                                                    }}
                                                    onPress={() => setWriteCommentVisible(true)}
                                                >
                                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                        {
                                                            user?.settings.leng === 'es-ES' ? spanish.episodeModalNewComment : english.episodeModalNewComment
                                                        }
                                                    </Text>
                                                </TouchableOpacity>
                                                ) : (
                                                    null
                                                )
                                            }
                                            <Modal
                                                animationType="fade"
                                                transparent={true}
                                                visible={writeCommentVisible}
                                                style={{
                                                    position: 'absolute',
                                                }}
                                            >
                                                <BlurView 
                                                    style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}
                                                    tint="dark"
                                                    intensity={20}
                                                >
                                                    <View style={{ 
                                                        justifyContent: 'space-between', 
                                                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff', 
                                                        width: '95%',
                                                        borderRadius: 10,
                                                        padding: 10, 
                                                    }}>
                                                        <View style={{ 
                                                            ...styles.subTitleDiv, 
                                                            width: '100%', 
                                                            justifyContent: 'space-between', 
                                                            marginTop: 0,
                                                            backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff', 
                                                        }}>
                                                            <Text style={{ 
                                                                fontSize: 20, 
                                                                fontWeight: 'bold',
                                                                color: colorScheme === 'dark' ? '#fff' : '#000'                                                                
                                                            }}>
                                                                {
                                                                    user?.settings.leng === 'es-ES' ? spanish.episodeModalNewComment : english.episodeModalNewComment
                                                                }
                                                            </Text>
                                                            <Icon name="md-close" size={30} color={
                                                                colorScheme === 'dark' ? '#fff' : '#000'
                                                            } onPress={() => setWriteCommentVisible(false)} />
                                                        </View>
                                                        <TextInput 
                                                            placeholder={
                                                                user?.settings.leng === 'es-ES' ? spanish.episodeModalNewCommentInput : english.episodeModalNewCommentInput
                                                            }
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: 10, 
                                                                borderRadius: 10,
                                                                marginTop: 10,
                                                                borderColor: '#e9e9e9',
                                                                borderWidth: 2,
                                                            }}
                                                            autoCorrect={true}
                                                            autoCapitalize="sentences"
                                                            multiline={true}
                                                            placeholderTextColor={
                                                                colorScheme === 'dark' ? '#fff' : '#000'
                                                            }
                                                            value={commentToPost}
                                                            onChangeText={(text) => setCommentToPost(text)}
                                                        />
                                                        <TouchableOpacity
                                                            style={{
                                                                backgroundColor: '#0055FF',
                                                                padding: 10,
                                                                borderRadius: 10,
                                                                marginBottom: 10,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                marginTop: 10,
                                                            }}
                                                            onPress={() => 
                                                                postCommentBtnAction()
                                                            }
                                                        >
                                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                                {
                                                                    user?.settings.leng === 'es-ES' ? spanish.episodeModalPost : english.episodeModalPost
                                                                }
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </BlurView>
                                            </Modal>
                                            <View
                                                style={{
                                                    width: '100%',
                                                    marginTop: 10,
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {
                                                    fullEpisode.comments.length > 0 && fullEpisode.comments.map((item: any, index: number) => (
                                                        <View
                                                            style={{ 
                                                                ...styles.commentCard, 
                                                                backgroundColor: colorScheme === 'dark' ? '#080808' : '#fff',
                                                            }}
                                                            key={index}
                                                        >
                                                            <View style={{ 
                                                                width: '100%', 
                                                                marginTop: 0, 
                                                                flexDirection: 'row', 
                                                                borderBottomColor: '#0055FF', 
                                                                borderBottomWidth: 1, 
                                                                paddingBottom: 5, 
                                                                alignItems: 'center'
                                                            }}>
                                                                <Text style={{ 
                                                                    fontSize: 14, 
                                                                    fontWeight: 'bold', 
                                                                    marginRight: 5,
                                                                    color: colorScheme === 'dark' ? '#fff' : '#000'
                                                                }}>{ item.userName }</Text>
                                                                <Text style={{ 
                                                                    fontSize: 12, 
                                                                    color: '#999'
                                                                }}>Author</Text>
                                                                <Text style={{ fontSize: 12, color: '#999', marginLeft: 10 }}>{
                                                                    item.date
                                                                }</Text>
                                                            </View>
                                                            <Text style={{ 
                                                                marginTop: 10,
                                                                fontSize: 16,
                                                                color: colorScheme === 'dark' ? '#fff' : '#000'
                                                            }}>{ item.comment }</Text>

                                                            <View
                                                                style={{
                                                                    width: '100%',
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-evenly',
                                                                    alignItems: 'center',
                                                                    marginTop: 10,
                                                                    backgroundColor: colorScheme === 'dark' ? '#121212' : '#e8e8e8',
                                                                    padding: 10,
                                                                    borderRadius: 10,
                                                                }}
                                                            >
                                                                <TouchableOpacity 
                                                                    style={ styles.likesAndComment }
                                                                    onPress={() => likeCommentAction(item.id, item.userName)}
                                                                >
                                                                    <Icon name={
                                                                        user?.likedComments.includes(item.id) ? 'heart' : 'heart-outline'
                                                                    } size={20} color="#0055FF" style={{ marginLeft: 10 }} />
                                                                    <Text style={{ fontSize: 12, color: '#999', marginLeft: 10 }}>{ item.likes } {
                                                                        item.likes === 1 ? 'like' : 'likes'
                                                                    }</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity 
                                                                    style={ styles.likesAndComment }
                                                                    onPress={() => showRepliesFunction(item)}    
                                                                >
                                                                    <Icon name="chatbubble" size={20} color="#0055FF" style={{ marginLeft: 10 }} />
                                                                    <Text style={{ fontSize: 12, color: '#999', marginLeft: 10 }}>{ item.replies.length } {
                                                                        item.replies.length === 1 ? 'comment' : 'comments'
                                                                    }</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))
                                                }
                                                {
                                                    fullEpisode.comments.length === 0 &&
                                                    <View style={{ 
                                                        width: '100%', 
                                                        alignItems: 'center'
                                                    }}>
                                                        <Image 
                                                            source={{
                                                            uri: `${
                                                                colorScheme === 'dark' 
                                                                ? 'https://res.cloudinary.com/dcho0pw74/image/upload/v1654122202/logoAnimationDark_mwgsas.gif' 
                                                                : 'https://res.cloudinary.com/dcho0pw74/image/upload/v1654034791/logoAnimation_hc8ec3.gif'
                                                            }` 
                                                            }}
                                                            style={{width: 100, height: 100}}
                                                        />
                                                        <Text
                                                            style={{
                                                                fontSize: 16,
                                                                marginTop: 10,
                                                                fontWeight: 'bold',
                                                                color: colorScheme === 'dark' ? '#fff' : '#000'
                                                            }}
                                                        >
                                                            No comments yet
                                                        </Text>
                                                    </View>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                    <View  style={{ height: 30 }}/>
                                </>
                                )
                            }
                            </ScrollView>
                        
                        ) : (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,

                                }}
                            >
                                <ActivityIndicator 
                                    size="small"
                                    color="#0055FF"
                                />
                            </View>
                        )
                    }
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={ showReplies }
                >
                    <BlurView
                        style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}
                        tint="dark"
                        intensity={20}
                    >
                        <View
                            style={{
                                width: '95%',
                                maxHeight: '90%',
                                backgroundColor: colorScheme === 'dark' ? '#080808' : '#fff',
                                borderRadius: 10,
                                padding: 10,
                                marginTop: 10,
                            }}
                        >
                        <ScrollView>
                            {
                            commentToShow.id ? (
                                <>
                                <View style={{ ...styles.subTitleDiv, width: '100%', justifyContent: 'space-between', marginTop: 0}}>
                                    <Text style={{ 
                                        fontSize: 20, 
                                        fontWeight: 'bold',
                                        color: colorScheme === 'dark' ? '#fff' : '#000'
                                    }}>{commentToShow.userName}</Text>
                                    <Icon name="md-close" size={30} color={
                                        colorScheme === 'dark' ? '#fff' : '#000'
                                    } onPress={() => setShowReplies(false)} />
                                </View>
                                <Text style={{
                                    marginTop: 10,
                                    fontSize: 16,
                                    color: colorScheme === 'dark' ? '#fff' : '#000'
                                }}>{ commentToShow.comment }</Text>
                                <View
                                    style={{
                                        width: '100%',
                                        flexDirection: 'row',
                                        justifyContent: 'space-evenly',
                                        alignItems: 'center',
                                        marginTop: 10,
                                        backgroundColor: colorScheme === 'dark' ? '#121212' : '#e8e8e8',
                                        padding: 10,
                                        borderRadius: 10,
                                    }}
                                >
                                    <TouchableOpacity
                                        style={ styles.likesAndComment }
                                        onPress={() => likeCommentAction(commentToShow.id, commentToShow.userName)}
                                    >
                                        <Icon name={
                                            user?.likedComments.includes(commentToShow.id) ? 'heart' : 'heart-outline'
                                        } size={20} color="#0055FF" style={{ marginLeft: 10 }} />
                                        <Text style={{ fontSize: 12, color: '#999', marginLeft: 10 }}>{ commentToShow.likes } {
                                            commentToShow.likes === 1 ? 'like' : 'likes'
                                        }</Text>
                                    </TouchableOpacity>
                                    </View>

                                    {/* Write a reply */}

                                    {
                                        user ? (
                                            <View
                                                style={{
                                                    width: '100%',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-evenly',
                                                    alignItems: 'center',
                                                    marginTop: 10,
                                                    padding: 10,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <TextInput
                                                    style={{
                                                        height: 40,
                                                        borderColor: '#0055FF',
                                                        borderWidth: 2,
                                                        padding: 10,
                                                        flex: 1,
                                                        borderTopStartRadius: 10,
                                                        borderBottomStartRadius: 10,
                                                        color: colorScheme === 'dark' ? '#fff' : '#000'
                                                    }}
                                                    placeholder="Write a reply"
                                                    placeholderTextColor={
                                                        colorScheme === 'dark' ? '#fff' : '#000'
                                                    }
                                                    onChangeText={(text) => setReplyText(text)}
                                                />
                                                <TouchableOpacity
                                                    style={{
                                                        width: '20%',
                                                        height: 40,
                                                        backgroundColor: '#0055FF',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderBottomEndRadius: 10,
                                                        borderTopEndRadius: 10,
                                                    }}
                                                    onPress={() => {
                                                        if (replyText.length > 0) {
                                                            replyCommentAction(commentToShow.id);
                                                            setReplyText('');
                                                        }
                                                    }}
                                                >
                                                    <Text style={{ color: '#fff', fontSize: 16 }}>Reply</Text>
                                                </TouchableOpacity>
                                            </View>
                                        
                                        ) : (
                                            null
                                        )
                                    }
                                    <View
                                        style={{
                                            width: '100%',
                                            alignItems: 'center',
                                        }}
                                    >
                                    {
                                        commentToShow.replies.map((item: any, index: number) => (
                                        <View
                                            style={{ 
                                                ...styles.commentCard, 
                                                backgroundColor: colorScheme === 'dark' ? '#121212' : '#e8e8e8',
                                            }}
                                            key={index}
                                        >
                                            <View style={{ width: '100%', marginTop: 0, flexDirection: 'row', borderBottomColor: '#0055FF', borderBottomWidth: 1, paddingBottom: 5, alignItems: 'center'}}>
                                                <Text style={{
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                    marginRight: 5,
                                                    color: colorScheme === 'dark' ? '#fff' : '#000'
                                                }}>{ item.userName }</Text>
                                                <Text style={{ fontSize: 12, color: '#999'}}>Author</Text>
                                                <Text style={{ fontSize: 12, color: '#999', marginLeft: 10 }}>{
                                                    item.date
                                                }</Text>
                                            </View>
                                            <Text style={{
                                                marginTop: 10,
                                                fontSize: 16,
                                                color: colorScheme === 'dark' ? '#fff' : '#000'
                                            }}>{ item.comment }</Text>                                          
                                        </View>
                                        ))
                                    }
                                    </View>
                                </>
                            ) : null
                            }
                        </ScrollView>
                        </View>
                    </BlurView>
                </Modal>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({

    modal: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        marginBottom: 200,
        top: 200,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },

    closeSection: {
        position: 'absolute',
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 100,
        top: 220,
        zIndex: 5,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },

    iconClose: {
        // position: 'absolute',
        // right: 0,
        // top: 0,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    
    text: {
        fontSize: 16,
        color: '#999',
        marginTop: 8,
    },

    subTitleDiv: {
        borderBottomColor: '#0055FF',
        borderBottomWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 10,
    },

    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    episodeImage: {
        width: 150,
        height: 100,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
    },

    commentCard: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 10,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
        width: '90%',
    },

    likesAndComment: {
        flexDirection: 'row',
        alignItems: 'center',
    },

})
