import { useEffect, useState } from "react"
import Head from 'next/head'
import NavigationBar from '../../components/NavigationBar'
import styles from "../../styles/Event.module.css"
import Loader from 'react-loader-spinner';
const languages = require('../../i18n/lang.json');
import { useForm, FormProvider } from "react-hook-form" 
import Cookie from '../../components/Cookie'

const manifestPre = "https://iiif.europeana.eu/presentation/";
const manifestPost = "/manifest?format=3";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const AvailableLanguages = ({eventId, itemId, langs, item}) => {
    const safeItemId = itemId.replace(/\//g, "-");
    const [reserved, setReserved] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {      
        async function fetchData() {
            fetch(apiUrl+"/item/getreservedsubtitles/"+eventId+"/"+safeItemId,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (response.error) {
                    setError(true);
                } else {
                    setReserved(response);
                    setLoaded(true);
                } 
            })
        }

        fetchData();
    }, []);

    return (
        <div>
            {
                (() => {
                    if (loaded) {
                        return (
                            <LanguageOptions eventId={eventId} safeItemId={safeItemId} langs={langs} reservedLanguages={reserved.results} itemId={itemId} item={item} />
                        )
                    } else if (error) {
                        return (
                            <span>
                                Login to subtitle
                            </span>
                        )
                    } else {
                        return (
                            null
                        )
                    }
                })()
            }
        </div>
    )
};

const LanguageOptions = ({ eventId, itemId, safeItemId, reservedLanguages, langs, item }) => {
    const [selectedLanguage, setSelectedLanguage] = useState("-1");

    const methods = useForm({
        mode: "onChange",
    })
    const {
        handleSubmit,
        register,
        formState,
    } = methods

    const onSubmit = data => {
        data["eventid"] = eventId;
        data["itemid"] = safeItemId;

        fetch(apiUrl+"/item/reservesubtitle",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(response => {
            if (response.error) {
                alert(response.error.item);
            } else if (response.success) {
                let manifestUrl = encodeURIComponent("https://api.subtitleathon.eu/manifest.php?manifest="+encodeURIComponent(manifestPre + itemId + manifestPost));
                window.open("https://editor.euscreen.eu?manifest="+manifestUrl+"&key="+response.success.key, "_self");
                //window.open("http://localhost:9000?manifest="+manifestUrl+"&key="+response.success.key, "_self");
                //window.open("https://preview2.video-editor.eu?manifest="+manifestUrl+"&key="+response.success.key, "_self");
            } else {
                //unknown error, server down?
            }
        });
    };

    return (
        <div>
            <FormProvider {...methods}>
                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <select 
                    id="language"
                    name="language"
                    defaultValue={selectedLanguage}
                    ref={register({
                        required: true,
                        validate: (value) => {
                            return value !== "-1";
                        } 
                    })}
                >
                    <option 
                        value="-1" 
                        disabled
                    >
                        Pick a language
                    </option>

                    {languages.locales && languages.locales.map((it, index) => {
                        let disabled = false;
                                    
                        //check if the language is already reserved
                        if (reservedLanguages) {
                            const match = reservedLanguages.filter((entry) => {
                                return entry.language === it.iso;
                            });
                            //match found,not this user
                            if (match.length > 0) {
                                disabled = true;
                            }
                            /*    && !match[0].userid) {
                                disabled = true;
                            } else if (match.length > 0 && match[0].userid) {
                                //match found for this user
                                disabled = false;
                                own = true;
                            }*/
                        }

                        const itemLanguage = languages.locales.filter((entry) => {
                            if (item.dcLanguage !== undefined) {
                                return item.dcLanguage.includes(entry.code);
                            } else {
                                return false;
                            }
                          }).length === 0 ? (
                            languages.locales.find((entry) => {  
                                return Object.keys(item.dcDescriptionLangAware).find((key) => {
                                        if (Object.keys(item.dcDescriptionLangAware).length == 1) {
                                            return key === entry.code;
                                        } else {
                                            if (Object.keys(item.dcDescriptionLangAware).length == 2) {
                                                if (key !== "def" && key !== "en") {
                                                    return key === entry.code;
                                                }
                                            } 
                                        }
                                    });
                                }) === undefined ? (
                                    "en-GB"
                                ) : 
                                languages.locales.find((entry) => {  
                                    return Object.keys(item.dcDescriptionLangAware).find((key) => {
                                            if (Object.keys(item.dcDescriptionLangAware).length == 1) {
                                                return key === entry.code;
                                            } else {
                                                if (Object.keys(item.dcDescriptionLangAware).length == 2) {
                                                    if (key !== "def" && key !== "en") {
                                                        return key === entry.code;  
                                                    }
                                                } 
                                            }
                                        });
                                    }).iso
                          )
                        :
                        languages.locales.find((e) => {
                            return item.dcLanguage.includes(e.code);
                        }).iso;

                        let languagesSupported =  [];
                        languagesSupported['de-DE'] = langs;
                        languagesSupported['es-ES'] = ['de-DE'];
                        languagesSupported['pl-PL'] = ['de-DE'];
                        languagesSupported['cs-CZ'] = ['de-DE'];
                        languagesSupported['nl-NL'] = ['de-DE', 'en-GB'];
                        languagesSupported['fr-FR'] = ['de-DE', 'en-GB'];

                        if (langs.includes(it.iso) && it.iso != itemLanguage && languagesSupported[itemLanguage].includes(it.iso)) {
                            return (
                                <option 
                                    value={it.iso} 
                                    name={it.iso}
                                    key={index} 
                                    disabled={disabled}
                                >
                                    {it.name}
                                </option>
                            )
                        } else {
                            return (
                                null
                            )
                        }
                    
                    })}
                </select>
                &nbsp; &nbsp;
                <button
                        type="submit"
                        className={styles.submitbutton}
                        disabled={!formState.isValid}
                >
                    Start        
                </button>
                </form>
            </FormProvider>
        </div>
    )
};

const openPlayer = (itemId) => {
    let manifestUrl = encodeURIComponent("https://api.subtitleathon.eu/manifest.php?manifest="+encodeURIComponent(manifestPre + itemId + manifestPost));

    let playerUrl = "https://player.subtitleathon.eu?manifest="+manifestUrl;
    window.open(playerUrl, "_new");
}

const ItemList = ({ items, eventId, langs }) => {
    return (
        <div className="row w-100 d-flex justify-content-around">
            {items.items && items.items.map((i, key) => {  
                return (
                <div className={`col-3 ${styles.videocard}`} key={key}>
                    <div className={`pt-4 pb-4 ${styles.videoinner}`}>
                        <div className={styles.imagecontainer}>
                        <img 
                            src={i.edmPreview} 
                            className={styles.videoimage}     
                        />
                        <div className={styles.overlay}>
                            <FontAwesomeIcon 
                                icon={faPlay} 
                                className={styles.playicon} 
                                onClick={() => openPlayer(i.id)}
                            />
                        </div>
                        <span className={styles.languagelabel}>{
                            languages.locales.filter((entry) => {
                                if (i.dcLanguage !== undefined) {
                                    return i.dcLanguage.includes(entry.code);
                                } else {
                                    return false;
                                }
                              }).length === 0 ? 
                              languages.locales.find((entry) => {  
                                return Object.keys(i.dcDescriptionLangAware).find((key) => {
                                        if (Object.keys(i.dcDescriptionLangAware).length == 1) {
                                            return key === entry.code;
                                        } else {
                                            if (Object.keys(i.dcDescriptionLangAware).length == 2) {
                                                if (key !== "def" && key !== "en") {
                                                    return key === entry.code;
                                                }
                                            } 
                                        }
                                    });
                                }) === undefined ? (
                                    "English"
                                ) : 
                                languages.locales.find((entry) => {  
                                    return Object.keys(i.dcDescriptionLangAware).find((key) => {
                                            if (Object.keys(i.dcDescriptionLangAware).length == 1) {
                                                return key === entry.code;
                                            } else {
                                                if (Object.keys(i.dcDescriptionLangAware).length == 2) {
                                                    if (key !== "def" && key !== "en") {
                                                        return key === entry.code;
                                                    }
                                                } 
                                            }
                                        });
                                    }).name
                            :
                            languages.locales.filter((entry) => {
                                return i.dcLanguage.includes(entry.code);
                            }).map((res, index) => {
                                if (index > 0) {
                                    return " / "+res.name
                                } else {
                                    return res.name 
                                }
                            })
                        }</span>
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {i.title[0]}
                        </div>
                        <div className={styles.videodescription}>
                            {i.dcDescription === undefined ? null : i.dcDescription[0]}                            
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            Subtitle in:
                        </div>
                        <AvailableLanguages eventId={eventId} itemId={i.id} langs={langs} item={i} />
                    </div>
                </div>)
            })}
        </div>
    )
};

const WarsawEvent = () => {
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ waitingForContent2, setWaitingForContent2 ] = useState(true);
    const [ items, setItems ] = useState([]);
    const [ langs, setLangs ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ eventid, setEventId ] = useState("6");
    const [ characters, setCharacters ] = useState(0);
    const [ minutes, setMinutes ] = useState(0);
    const [ nrLanguages, setNrLanguages ] = useState(0);
    const [ leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        async function fetchData() {
            fetch(apiUrl+"/event/list/"+eventid,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (response.error) {                  
                    setError("Event not active");
                    setWaitingForContent(false);
                } else {
                    setItems(response);
                    setWaitingForContent(false);
                } 
            });
        }
        fetchData();
    }, []);

    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        async function checkUser() {
            const user = Cookie.getCookie("user");
            if (user !== null) {
                setLoggedIn(true);
            }
        }
        checkUser();
    }, []);

    useEffect(() => {
        async function fetchData() {
            fetch(apiUrl+"/event/availableLanguages/"+eventid,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (response.error) {                  
                    setError("Event not active");
                    setWaitingForContent2(false);
                } else {
                    setLangs(response.success.allowed_languages);
                    setWaitingForContent2(false);
                } 
            });
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchData() {
            fetch(apiUrl+"/event/statistics/"+eventid,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (!response.error) {                  
                    setCharacters(response.characters);
                    setMinutes(Math.floor(response.milliseconds / (60 * 1000)));
                    setNrLanguages(response.languages);
                } 
            });
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchData() {
            fetch(apiUrl+"/event/leaderboard/"+eventid,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (!response.error) {                  
                    setLeaderboard(response);
                } 
            });
        }
        fetchData();
    }, []);


    return (
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Warsaw Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                                <a name="warsaw">Subtitle-a-thon Challenge Frankfurt</a>
                            </p>
                            <p className={styles.whitetext}>
                                Join the Europeana XX: Subtitle-a-thon! Try your hand at subtitling Europe’s audiovisual heritage – from early silent documentaries and newsreels to advertising and industrial films from the 50s to 70s – in German and other languages, and make it accessible to other people. Our motto: <span className="font-italic">"Subtitle the Past, Translate for the Future"</span>.
                            </p>
                            <p className={styles.whitetext}>
                                The DFF - Deutsches Filminstitut & Filmmuseum cordially invites all language and film culture buffs to participate in our online event!
                            </p>
                            <p className={styles.whitetext}>
                                Subtitle-a-thon running time: July 6-11, 2021.<br/>
                                Kick off event: Tuesday, July 6 from 4:00 p.m. to 6:00 p.m. on Zoom.<br/>
                                Wrap up event: Sunday, July 11 at 5:00 p.m. on Zoom<br/>
                            </p>
                            <br/>
                            <p className={`font-weight-bold ${styles.whitetext}`}>
                                IMPORTANT DATES:
                            </p>
                            <p className={styles.whitetext}>
                                June 22 - July 5: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p className={styles.whitetext}>
                                July 6 - July 11: Subtitle-a-thon
                            </p>
                            <p className={styles.whitetext}>
                                July 6 16:00-18:00 CET: Kick off
                            </p>
                            <p className={styles.whitetext}>
                                July 11 10:00 CET: Deadline for reserving videos
                            </p>
                            <p className={styles.whitetext}>
                                July 11 17:00 CET: Deadline for submitting your videos
                            </p>
                            <p className={styles.whitetext}>
                                July 11 17:00-18:00 CET: Wrap up
                            </p>
                            <p className={styles.whitetext}>
                                July 20: Announcement of Winners (on the subtitle-a-thon website)
                            </p>
                            <p className={styles.whitetext}>
                                The opening and closing sessions will be held in English.
                            </p>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.progressheader}>Progress</p>
                            <div className={styles.progressblock}>
                                <div className="row pt-2">
                                    <div className={`col-4 ${styles.statisticsnumber}`}>
                                        {minutes == 0 ? (
                                            <>
                                            ???
                                            </>
                                        ) : (
                                            <>
                                            {minutes}
                                            </>
                                        )
                                    }
                                    </div>
                                    <div className={`col-4 ${styles.statisticsnumber}`}>
                                        {characters == 0 ? (
                                            <>
                                            ???
                                            </>
                                        ) : (
                                            <>
                                            {characters}
                                            </>
                                        )
                                        }
                                    </div>
                                    <div className={`col-4 ${styles.statisticsnumber}`}>
                                        {nrLanguages == 0 ? (
                                            <>
                                            ???
                                            </>
                                        ) : (
                                            <>
                                            {nrLanguages}
                                            </>
                                        )
                                        }
                                    </div>
                                </div>
                                <div className="row pb-2">
                                    <div className={`col-4 ${styles.statisticsdesc}`}>minutes</div>
                                    <div className={`col-4 ${styles.statisticsdesc}`}>characters</div>
                                    <div className={`col-4 ${styles.statisticsdesc}`}>languages</div>
                                </div>
                            </div>
                            {leaderboard.length > 0 ? (
                                <div className={`mt-4 pt-3 mb-4 ${styles.progressblock}`}>
                                    <p className={styles.leaderboardheader}>Leaderboard</p>
                                    {leaderboard.map((element, index) => {
                                        return(<div className="row pb-2" key={index}>
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                {index+1}
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                {element.username}<br/>
                                                <span className={styles.leaderboardparticipantnumber}>{element.characters}</span> <span className={styles.leaderboardparticipantcharacters}>characters</span>
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                        </div>)
                                    })}
                                </div>
                            ) : (
                                null
                            )}
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row mt-4 pt-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                            <h2 className={`${styles.videoheader}`}>
                                Frankfurt videos
                            </h2>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                        <p>We have compiled a selection of film clips from various European film heritage institutions for you. Most of the videos are from the collection of the DFF - Deutsches Filminstitut & Filmmuseum. In addition, you will find clips from the Cinématheque Royale de Belgique, the Filmoteca Española, the Národní filmový archiv and the Filmoteka Narodowa. From silent slapstick to WW1 documentaries, industrial and commercial films, as well as playful animations, it's all here! We hope you enjoy exploring the 20th century in Europe through these cinematic finds.</p>
                        <p>Wir haben für euch eine Auswahl an Filmclips aus verschiedenen europäischen Filmerbeeinrichtungen zusammengestellt. Der Großteil der Videos stammt aus der Sammlung des DFF - Deutsches Filminstitut & Filmmuseum. Darüber hinaus findet ihr hier Clips der Cinématheque Royale de Belgique, der Filmoteca Española, des Národní filmový archiv und der Filmoteka Narodowa. Von Stummfilm-Slapstick über Dokumentationen aus dem 1. Weltkrieg, Industrie- und Werbefilmen, bis hin zu verspielten Animationsfilmen ist alles dabei! Wir hoffen, ihr habt Freude daran anhand dieser filmischen Fundstücke das 20. Jahrhundert in Europa zu erkunden.</p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row mt-4 pt-4 pb-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                        {
                            (() => {
                                if (waitingForContent || waitingForContent2) {
                                    return (
                                        <Loader type="Oval"  className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                                    )
                                } else if (error === null) {
                                    if (loggedIn) {
                                        return (
                                            <ItemList items={items} eventId={eventid} langs={langs} />
                                        )
                                    } else {
                                        return (
                                            <div className="d-flex justify-content-center">
                                                <h2>Only signed in users can see these videos</h2>
                                            </div>
                                        )
                                    }
                                } else {
                                    return (
                                        <div className="d-flex justify-content-center">
                                            <h2>{error}</h2>
                                        </div>
                                    )
                                }
                            })()
                        }
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
            </main>          
        </div>
    )
}

export default WarsawEvent