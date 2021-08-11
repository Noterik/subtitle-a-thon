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

                        const itemLanguage = languages.locales.find((entry) => {
                            return Object.keys(item.dcDescriptionLangAware).find((key) => {
                              if (item.dcDescriptionLangAware[key][0].startsWith("Original language summary:")) {
                                return key === entry.code;
                              }
                           });
                          }) === undefined ? (
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
                        languages.locales.find((entry) => {
                            return Object.keys(item.dcDescriptionLangAware).find((key) => {
                                if (item.dcDescriptionLangAware[key][0].startsWith("Original language summary:")) {
                                    return key === entry.code;
                                }
                            });
                        }).iso;

                        if (langs.includes(it.iso) && it.iso != itemLanguage) {
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
                            languages.locales.find((entry) => {
                                return Object.keys(i.dcDescriptionLangAware).find((key) => {
                                  if (i.dcDescriptionLangAware[key][0].startsWith("Original language summary:")) {
                                    return key === entry.code;
                                  }
                               });
                              }) === undefined ? 
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
                            languages.locales.find((entry) => {
                                    return Object.keys(i.dcDescriptionLangAware).find((key) => {
                                      if (i.dcDescriptionLangAware[key][0].startsWith("Original language summary:")) {
                                        return key === entry.code;
                                      }
                                   });
                                  }).name
                        }</span>
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {i.title[0]}
                        </div>
                        <div className={styles.videodescription}>
                            {i.dcDescription === undefined ? null : i.dcDescription[1]}                            
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
    const [ eventid, setEventId ] = useState("5");
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
                                <a name="warsaw">Subtitle-a-thon Challenge Warsaw</a>
                            </p>
                            <p className={styles.whitetext}>
                                Join us for the Europeana XX: Subtitle-a-thon challenge in Warsaw and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                            </p>
                            <p className={styles.whitetext}>
                                The National Film Archive - Audiovisual Institute (FINA) and The European Union National Institutes for Culture (EUNIC) Cluster Warsaw are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.whitetext}>
                                The kick-off of the subtitle-a-thon takes place on Saturday, June 12th at 11.00 CET with a two hour introductory session, and will run online for seven days with a closing session on Friday, June 18th at 17.00 CET.
                            </p>
                            <br/>
                            <p className={`font-weight-bold ${styles.whitetext}`}>
                                IMPORTANT DATES:
                            </p>
                            <p className={styles.whitetext}>
                                May 20 - June 10: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p className={styles.whitetext}>
                                June 12 - June 18: Subtitle-a-thon
                            </p>
                            <p className={styles.whitetext}>
                                June 12 11:00-13:00 CET: opening session
                            </p>
                            <p className={styles.whitetext}>
                                June 18 17:00-18:00 CET: closing session
                            </p>
                            <p className={styles.whitetext}>
                                June 25: Announcement of Winners (on the subtitle-a-thon website)
                            </p>
                            <p className={styles.whitetext}>
                                The opening and closing sessions will be held in English with Polish simultaneous translation.
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
                                Warsaw videos
                            </h2>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                        <p>We have assembled for you a collection of short audiovisual clips from various European audiovisual archives. The majority of the videos come from the collection of the Polish National Film Archive – Audiovisual Institute. But you will also find here remarkable clips from the French National Audiovisual Institute – Ina, RTÉ Ireland's National Television and Radio Broadcaster and the Netherlands Insitute for Sound and Vision. We hope you will enjoy exploring these beautiful animations, newsreels fragments and short reportages. All of them depict amazing stories captured on a film reel.</p>
                        <p>Wybraliśmy kolekcję krótkich audiowizualnych klipów pochodzących z różnych europejskich archiwów. Większość materiałów należy do kolekcji Filmoteki Narodowej- Instytutu Audiowizualnego. Ale dodaliśmy również materiały Francuskiego Narodowego Instytutu Audiowizualnego – Ina, irlandzkiego publicznego radia i telewizji – RTÉ oraz Niderlandzkiego Instytutu Sound and Vision. Mamy nadzieję, że spodobają się Wam wybrane przez nas piękne animacje, fragmenty kronik filmowych i krótkie reportaże. Wszystkie zawierają niesamowite historie uchwycone na taśmie filmowej.</p>
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