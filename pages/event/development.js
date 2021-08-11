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

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const AvailableLanguages = ({eventId, itemId}) => {
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
                            <LanguageOptions eventId={eventId} safeItemId={safeItemId} reservedLanguages={reserved.results} itemId={itemId} />
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

const LanguageOptions = ({ eventId, itemId, safeItemId, reservedLanguages }) => {
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
                //TODO: set error
            } else if (response.success) {
                //TODO: display message account created successfully
                let manifestUrl = encodeURIComponent(manifestPre + itemId + manifestPost);
                window.open("https://editor.euscreen.eu?manifest="+manifestUrl+"&key="+response.success.key, "_blank");
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

                    {languages.locales && languages.locales.map((item, index) => {
                        let disabled = false;
                        let own = false;
                                    
                        //check if the language is already reserved
                        if (reservedLanguages) {
                            const match = reservedLanguages.filter((entry) => {
                                return entry.language === item.iso;
                            });
                            //match found,not this user
                            if (match.length > 0 && !match[0].userid) {
                                disabled = true;
                            } else if (match.length > 0 && match[0].userid) {
                                //match found for this user
                                disabled = false;
                                own = true;
                            }
                        }
                        return (
                            <option 
                                value={item.iso} 
                                name={item.iso}
                                key={index} 
                                disabled={disabled}
                            >
                                {item.name}
                            </option>
                        )
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

const ItemList = ({ items, eventId }) => {
    return (
        <div className="row w-100 d-flex justify-content-around">
            {items.items && items.items.map((i, key) => {  
                return (
                <div className={`col-3 ${styles.videocard}`} key={key}>
                    <div className={styles.videoinner}>
                        <img src={i.edmPreview} className={styles.videoimage} />
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {i.title[0]}
                        </div>
                        <div className={styles.videodescription}>
                            {i.dcDescription === undefined ? null : i.dcDescription[0]}                        
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            SUBTITLE LANGUAGE
                        </div>
                        <AvailableLanguages eventId={eventId} itemId={i.id} />
                    </div>
                </div>)
            })}
        </div>
    )
};

const Development = () => {
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ eventid, setEventId ] = useState("1");

    useEffect(() => {
        async function fetchData() {
            fetch(apiUrl+"/event/list/"+eventid,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (response.error) {                  
                    setError("Event not found or not active");
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

    const join = (id) => {
        if (loggedIn) {
            fetch(apiUrl+"/event/join/"+id,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                console.log(response);
                if (!response.error && response.success) {
                    window.location.href = "/profile";
                }
            });
        } else {
            window.location.href = "/login";
        }
    };

    return (
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <h1 className={styles.header}>Development subtitle-a-thon</h1>
            <h2 className={styles.subheader}>Subtitle-a-thon - Europeana XX</h2>  

            <div className="row w-100 pt-4">
                <div className={`col-6 ${styles.purplebackground}`}>
                    <h2 className={styles.eventheader}>
                        Development Subtitle-a-thon
                    </h2>
                    <p className={styles.whitetext}>
                    Join us for the Europeana XX: Subtitle-a-thon challenge in Warsaw and share with us your language and subtitling skills to Subtitle the Past, Translate for the Future.
                    </p>
                    <p className={styles.whitetext}>
                    The National Film Archive - Audiovisual Institute (FINA) and The European Union National Institutes for Culture (EUNIC) Cluster Warsaw are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                    </p>
                    <p className={styles.whitetext}>
                    The kick-off of the subtitle-a-thon takes place on Saturday, June 12th at 11.00 CET with a two hour introductory session, and will run online for nine days with a closing session on Monday, June 21st at 17.00 CET. In this period you can join the project at any time convenient for you.
                    </p>
                    <p className="d-flex justify-content-end pt-4">
                        <div className={styles.button} onClick={() => join(1)}>
                            Join event
                        </div>
                    </p>
                </div>
                <div className="col-6">
                    <div className={styles.eventimageodd}>
                        <div className={styles.eventimagedatewrapper}>
                            <div className={styles.evendateblock}>
                                <span className={styles.eventdateblockdates}>
                                    7-20
                                </span>
                                <hr className={styles.evendateblockline}/>
                                <span className={styles.eventdateblockmonth}>
                                    April
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row w-100 pt-4">
                    <div className="col-1"></div>
                    <div className="col-5">
                        <h2 className={styles.eventheaderblack}>The challenge</h2>
                        <p>
                        The participants will be subtitling short audiovisual clips coming from FINA’s archival collection, as well as from other, leading European audiovisual archives, whose content is available on Europeana.eu. 
                        </p>
                        <p className="font-weight-bold">
                        We invite you to:
                        </p>
                        <ul>
                            <li>Create subtitles to a variety of short audiovisual clips, like the Polish cartoons or Italian newsreels in any European language.</li>
                            <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                            <li>At the same time join the community of ‘citizen linguists’ and audiovisual heritage fans.</li>
                            <li>Win a prize (Amazon gift cards) for becoming the best subtitler!</li>
                        </ul>
                    </div>
                    <div className="col-5">
                        <h2 className={styles.eventheaderblack}>Who can take part?</h2>
                        <p>
                        We are inviting translators, language teachers, linguists and advanced language students (C1 and above) that are eager to immerse themselves in the wealth of European audiovisual heritage to make it broadly understood by enriching it with subtitles. 
                        </p>
                        <p className="font-weight-bold">
                        So, if you:
                        </p>
                        <ul>
                            <li>speak one or many foreign languages*</li>
                            <li>spell, punctuate and use grammar accurately</li>
                            <li>translate the dialogue into the required language sensitively</li>
                            <li>work precisely with text and timing</li>
                        </ul>
                        <p>
                        ...then we are looking for you and challenge you to dedicate to the task at least 4 hours during the week. There is of course no maximum. 
                        </p>
                        <p className="font-italic">
                        * Although knowledge of Polish is not a must to join the subtitle-a-thon, please note that the majority of audiovisual clips available for the event will be coming from FINA’s collection in Polish.
                        </p>
                    </div>
                    <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-4">
                    <div className="col-1"></div>
                    <div className="col-5">
                        <h2 className={styles.eventheaderblack}>How can you participate?</h2>
                        <p>
                        To join you need to submit the <a href="/sign-up">registration form</a> no later than <span className="font-weight-bold">June 2, 2021</span>. Registration will be accepted on a first come first served basis as availability is limited.
                        </p>
                        <p className="font-weight-bold">
                        IMPORTANT DATES:
                        </p>
                        <p>
                        May 17: Opening of Registration 
                        </p>
                        <p>
                        June 4: Notification of Acceptance 
                        </p>
                        <p>
                        June 12 - June 21: Subtitle-a-thon
                        </p>
                        <p>
                        June 12 11:00-13:00 CET: opening session
                        </p>
                        <p>
                        June 21 17:00-18:00 CET: closing session
                        </p>
                        <p>
                        June 25: Announcement of Winners (on the subtitle-a-thon website)
                        </p>
                    </div>
                    <div className="col-5">
                        <h2 className={styles.eventheaderblack}>About the organisers</h2>
                        <p>
                        <span className={styles.underline}>Europeana XX. A Century of Change is a project</span>, co-financed by the Connecting Europe Facility Programme of the European Union.
                        </p>
                        <p>
                        The Warsaw Subtitle-a-thon is a collaboration between the project, hosted by the National Film Archive - Audiovisual Institute supported by EUNIC Warsaw cluster  members:
                        </p>
                        <ol>
                            <li><a href="https://austria.org.pl/" target="_blank">Austrian Cultural Forum</a></li>
                            <li><a href="https://www.britishcouncil.pl/" target="_blank">British Council</a></li>
                            <li><a href="http://www.camoes.pl/?lang=pl" target="_blank">Camões Institute</a></li>
                            <li><a href="https://www.netherlandsandyou.nl/your-country-and-the-netherlands/poland" target="_blank">Embassy of the Kingdom Netherlands</a></li>
                            <li><a href="https://www.institutfrancais.pl/fr" target="_blank">Institut français de Pologne </a></li>
                            <li><a href="https://varsovia.cervantes.es/pl/default.shtm" target="_blank">Instituto Cervantes</a></li>
                            <li><a href="https://www.icr.ro/" target="_blank">Romanian Cultural Institute</a></li>
                        </ol>
                    </div>
                    <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-4">
                <div className={`col-6 ${styles.purplebackground}`}>
                    <h2 className={styles.eventheader}>Contact us</h2>
                    <p className={styles.whitetext}>
                        For all your questions: feel free to get in touch with us at <a href="mailto:subtitleathon@fina.gov.pl">subtitleathon@fina.gov.pl</a>. and we will get back to you as soon as possible.
                    </p>
                </div>
                <div className={`col-6 ${styles.purplebackground}`}>

                </div>
            </div>
            <h2 className={styles.blackSubHeader}>Development videos</h2>
            {
                (() => {
                    if (waitingForContent) {
                        return (
                            <Loader type="Oval"  className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                        )
                    } else if (error === null) {
                        if (loggedIn) {
                            return (
                                <ItemList items={items} eventId={eventid} />
                            )
                        } else {
                            return (
                                <div className="d-flex justify-content-center">
                                    <h2>Login to view the videos</h2>
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
    )
}

export default Development