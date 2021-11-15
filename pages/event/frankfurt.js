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

const Frankfurt = () => {
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ eventid, setEventId ] = useState("3");

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

    const join = (id) => {
        if (loggedIn) {
            fetch(apiUrl+"/event/join/"+id,
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
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
                <title>Subtitle-a-thon | Frankfurt Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Frankfurt subtitle-a-thon</h1>
                            <h2 className={styles.subheader}>Europeana XX: Subtitle-a-thon Challenge</h2>  
                        </div>
                    </div>
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
                            <p className={styles.whitetext}>
                                We are looking forward to seeing you! You will receive further information after registration.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/registration">
                                    <div className={styles.button}>
                                        Register
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimageeven}>
                                <div className={styles.eventimagedatewrapper}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockleft}`}>
                                        <span className={styles.eventdateblockdates}>
                                            6-11
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            July
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimageeven}>
                                <div className={`${styles.eventimagedatewrapper} justify-content-end`}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockright}`}>
                                        <span className={styles.eventdateblockdates}>
                                            6-11
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Juli
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="warsaw">Subtitle-a-thon Challenge Frankfurt</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Mach mit beim Europeana XX: Subtitle-a-thon! Hilf uns das audiovisuelle Erbe Europas – von kurzen dokumentarischen Stummfilmen und Newsreels bis hin zu Werbefilm-Clips aus den 1950er bis 70er-Jahren – in Deutsch und anderen Sprachen zu untertiteln. Damit werden diese einzigartigen Clips einem breiten Publikum zugänglich gemacht. Unser Motto dabei: <span className="font-italic">“Subtitle the Past, Translate for the Future”</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Das DFF - Deutsches Filminstitut & Filmmuseum lädt alle an Sprachen und Filmkultur Interessierten herzlich ein am Online-Event teilzunehmen! 
                            </p>
                            <p className={styles.whitetext}>
                                Der DFF-Subtitle-a-thon findet vom 6. bis 11. Juli 2021 online statt.<br/>
                                Kick off: Dienstag, den 6. Juli von 16:00 bis 18:00 Uhr auf Zoom<br/>
                                Wrap up: Sonntag, den 11. Juli um 17:00 Uhr auf Zoom<br/>
                            </p>
                            <p className={styles.whitetext}>
                                Wir freuen uns auf Euch! Weitere Infos zum Ablauf folgen nach der Anmeldung.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/registration">
                                    <div className={styles.button}>
                                        Registrieren
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>The challenge</h2>
                            <p>
                            The participants will be subtitling short clips coming from DFF’s archival collection, as well as from other, leading European audiovisual archives, whose content is available on <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                We invite you to:
                            </p>
                            <ul>
                                <li>Create subtitles for a variety of short audiovisual clips, such as (but not limited to) short documentaries and newsreels from the first half of the 20th century (silent with intertitles) and commercials and animated films from the second half (with sound).</li>
                                <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                                <li>At the same time join the community of language enthusiasts and audiovisual heritage fans.</li>
                                <li>Win a prize (Avocadostore gift cards) for becoming one of the best Europeana XX subtitlers!</li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Die Challenge</h2>
                            <p>
                                Die Teilnehmer:innen untertiteln kurze Clips, die aus der Sammlung des DFF, aber auch aus Sammlungen weiterer führender europäischer audiovisueller Archive, stammen, deren Inhalte auf <a href="https://europeana.eu" target="_blank">Europeana.eu</a> verfügbar sind.
                            </p>
                            <p className="font-weight-bold">
                                Wir laden dazu ein:
                            </p>
                            <ul>
                                <li>Erstelle Untertitel für eine Vielzahl an kurzen audiovisuellen Clips, wie z.B. (aber  nicht nur) Kurz-Dokumentarfilme und Newsreels aus der ersten Hälfte des 20. Jahrhunderts (stumm mit Zwischentiteln) und Werbespots und Animationsfilme aus der zweiten Hälfte (mit Sound).</li>
                                <li>Teste ein neues Tool und deine Sprachkenntnisse in einer freundlichen und unterhaltsamen Umgebung.</li>
                                <li>Schließe dich gleichzeitig einer Community aus Sprachenthusiast:innen und Fans des audiovisuellen Erbes an.</li>
                                <li>Gewinne einen Preis (Gutscheine von Avocadostore) für die besten und meisten Europeana XX-Untertitel!</li>
                            </ul>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className={`col-12 col-lg-6 pt-5 pb-5 pl-5 pr-5 ${styles.purplebackground}`}>
                            <p className={`${styles.eventheader}`}>
                                Announcement of winners
                            </p>
                            <br/>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">2 locations</span> (Germany & Poland),<br/>
                                <span className="font-weight-bold">101</span> new subtitles,<br/>
                                <span className="font-weight-bold">18</span> active subtitlers,<br/>
                                <span className="font-weight-bold">8</span> languages,<br/>
                                <span className="font-weight-bold">169 661</span> characters<br/>
                                and <span className="font-weight-bold">210</span> minutes of subtitles!!!<br/><br/>
                                <span className="font-weight-bold">Here are the results of Europeana XX: Subtitle-a-thon Challenge Frankfurt!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                And here are <span className="font-weight-bold">the winners!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                1st prize - 75 Euro gift card to avocadostore.de – <span className="font-weight-bold">Małgorzata Korycińska-Wegner</span>
                            </p>
                            <p className={styles.whitetext}>
                                2nd prize - 50 Euro gift card to avocadostore.de - <span className="font-weight-bold">Irene Brouwer</span>
                            </p>
                            <p className={styles.whitetext}>
                                3rd prize - 25 Euro gift card to avocadostore.de - <span className="font-weight-bold">Aida Suárez Trabanco</span>
                            </p>    
                            <div className={`mt-4 pt-3 mb-4 pb-4 ${styles.progressblock}`}>
                                <p className={styles.leaderboardheader}>Leaderboard</p>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                1
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Małgorzata Korycińska-Wegner
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                2
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Irene Brouwer
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                3
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Aida Suárez Trabanco
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                4
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Hannah Leah Neugebauer
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                5
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Johanna Greenslade
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                6
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Sophie Ebersbach
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                7
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Mirjam Larissa Walter
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                8
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Alinor Labbé
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                9
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Marlena Małecka
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                10
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Lara Ringel
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                            </div>
                            <p className={styles.whitetext}>
                                The prizes were awarded by the Challenge organisers based on the amount of subtitled characters and quality of the subtitles. <span className="font-weight-bold">Congratulations!</span>
                            </p>
                            <p className={styles.whitetext}>
                                All entrants will receive in their mailboxes a participation certificate.
                            </p>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">Thank you all for your participation</span> in the Europeana XX: Subtitle-a-thon Challenge Frankfurt!
                            </p>    
                        </div>
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimagewinners}>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimagewinners}>

                            </div>
                        </div>
                        <div className={`col-12 col-lg-6 pt-5 pb-5 pl-5 pr-5 ${styles.purplebackground}`}>
                            <p className={`${styles.eventheader}`}>
                                Bekanntgabe der Gewinner:innen
                            </p>
                            <br/>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">2 Standorte</span> (Deutschland & Polen),<br/>
                                <span className="font-weight-bold">101</span> neue Untertitel,<br/>
                                <span className="font-weight-bold">18</span> aktive Untertitler:innen,<br/>
                                <span className="font-weight-bold">8</span> Sprachen,<br/>
                                <span className="font-weight-bold">169 661</span> Zeichen<br/>
                                und <span className="font-weight-bold">210</span> Minuten an Untertiteln!!!<br/><br/>
                                <span className="font-weight-bold">Hier sind die Ergebnisse der Europeana XX: Subtitle-a-thon Challenge Frankfurt!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                Und hier sind die <span className="font-weight-bold">Gewinner!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                1. Preis - 75 Euro Gutschein für avocadostore.de - <span className="font-weight-bold">Małgorzata Korycińska-Wegner</span>
                            </p>
                            <p className={styles.whitetext}>
                                2. Preis - 50 Euro Gutschein für avocadostore.de - <span className="font-weight-bold">Irene Brouwer</span>
                            </p>
                            <p className={styles.whitetext}>
                                3. Preis - 25 Euro Gutschein für avocadostore.de - <span className="font-weight-bold">Aida Suárez Trabanco</span>
                            </p>    
                            <div className={`mt-4 pt-3 mb-4 pb-4 ${styles.progressblock}`}>
                                <p className={styles.leaderboardheader}>Leaderboard</p>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                1
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Małgorzata Korycińska-Wegner
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                2
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Irene Brouwer
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                3
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Aida Suárez Trabanco
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                4
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Hannah Leah Neugebauer
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                5
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Johanna Greenslade
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                6
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Sophie Ebersbach
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                7
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Mirjam Larissa Walter
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                8
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Alinor Labbé
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                9
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Marlena Małecka
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={'col-1 col-lg-2'}></div>
                                            <div className={`col-1 my-auto ${styles.leaderboardnumber}`}>
                                                10
                                            </div>
                                            <div className={`col-1`}></div>
                                            <div className={`col-8 col-lg-6 ${styles.leaderboardparticipant}`}>
                                                Lara Ringel
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                            </div>
                            <p className={styles.whitetext}>
                            Die Preise wurden von den Organisator:innen der Challenge auf der Grundlage der Anzahl der untertitelten Zeichen und der Qualität der Untertitel vergeben. <span className="font-weight-bold">Herzlichen Glückwunsch!</span>
                            </p>
                            <p className={styles.whitetext}>
                                Alle Teilnehmer:innen erhalten in ihrem Postfach ein Teilnahmezertifikat.
                            </p>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">Vielen Dank an alle für Ihre Teilnahme</span> an der Europeana XX: Subtitle-a-thon Challenge Frankfurt!
                            </p>   

                        </div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Who can take part?</h2>
                            <p>
                                We are inviting translation enthusiasts and advanced language students (C1 and above) that are eager to immerse themselves in the wealth of European audiovisual heritage to make it broadly understood by enriching it with subtitles.
                            </p>
                            <p className="font-weight-bold">
                                So, if you:
                            </p>
                            <ul>
                                <li>speak German and one or several of the following languages: English, French, Spanish, Polish, Czech, Norwegian, Swedish, Danish, Flemish/Dutch</li>
                                <li>spell, punctuate and use grammar accurately</li>
                                <li>translate the dialogue into the required language sensitively</li>
                                <li>have a good sense for text and timing</li>
                                <li>are able to dedicate to the task at least 4 hours during the week</li>
                            </ul>
                            <p>
                                ...then we are looking for you!
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Wer kann mitmachen?</h2>
                            <p>
                                Wir laden Übersetzungsenthusiast:innen und fortgeschrittene Sprachstudierende (C1 und höher) ein, in das europäische audiovisuelle Erbe einzutauchen und es mithilfe von Untertiteln einem breiten Publikum verständlich zu machen.
                            </p>
                            <p className="font-weight-bold">
                                Also, wenn du:
                            </p>
                            <ul>
                                <li>Deutsch und eine oder mehrere dieser Fremdsprachen sprichst: Englisch, Französisch, Spanisch, Polnisch, Tschechisch, Norwegisch, Schwedisch, Dänisch, Flämisch/Niederländisch</li>
                                <li>Rechtschreibung, Zeichensetzung und Grammatik korrekt anwenden kannst</li>
                                <li>Dialoge einfühlsam in die gewünschte Sprache übersetzen kannst</li>
                                <li>gutes Gespür für Text und Timing hast</li>
                                <li>Zeit hast dieser Aufgabe, im Laufe der Woche, mindestens 4 Stunden zu widmen</li>
                            </ul>
                            <p>
                                ...dann suchen wir genau dich!
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>How can you participate?</h2>
                            <p>
                                To join you need to submit the <a href="/registration">registration form</a> no later than <span className="font-weight-bold">Monday, July 5, 2021</span>. Registration will be accepted on a first come first served basis as availability is limited.
                            </p>
                            <p className="font-weight-bold">
                                IMPORTANT DATES:
                            </p>
                            <p>
                                June 22 - July 5: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p>
                                July 6 - July 11: Subtitle-a-thon
                            </p>
                            <p>
                                July 6 16:00-18:00 CET: Kick off
                            </p>
                            <p>
                                July 11 10:00 CET: Deadline for reserving videos
                            </p>
                            <p>
                                July 11 17:00 CET: Deadline for submitting your videos
                            </p>
                            <p>
                                July 11 17:00-18:00 CET: Wrap up
                            </p>
                            <p>
                                July 20: Announcement of Winners (on the subtitle-a-thon website)
                            </p>
                            <p>
                                The opening and closing sessions will be held in English.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Wie mitmachen?</h2>
                            <p>
                                Um teilzunehmen, musst du das <a href="/registration">Anmeldeformular</a> bis spätestens <span className="font-weight-bold">Montag, 5. Juli 2021</span>, einreichen. Die Registrierung erfolgt nach einem First-come-first-serve Prinzip, da die Anzahl der Plätze begrenzt ist.
                            </p>
                            <p className="font-weight-bold">
                                WICHTIGE TERMINE:
                            </p>
                            <p>
                                22. Juni - 5. Juli: Registrierung offen, (die Teilnahme wird innerhalb von 5 Tagen bestätigt)
                            </p>
                            <p>
                                6. Juli - 11. Juli: Subtitle-a-thon
                            </p>
                            <p>
                                6. Juli 16:00-18:00 Uhr MEZ: Kick off
                            </p>
                            <p>
                                11. Juli 17:00-18:00 Uhr MEZ: Wrap up
                            </p>
                            <p>
                                20. Juli: Bekanntgabe der Gewinner:innen (auf der subtitle-a-thon Website)
                            </p>
                            <p>
                                Das Kick Off und der Wrap up werden in Englisch abgehalten.
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>About the organisers</h2>
                            <p>
                                <span className={styles.underline}>Europeana XX. A Century of Change is a project</span>, co-financed by the Connecting Europe Facility Programme of the European Union.
                            </p>
                            <p>
                                The Europeana XX Subtitle-a-thon Challenge Frankfurt is a collaboration between the project, hosted by one of the project partners - the DFF - Deutsches Filminstitut & Filmmuseum, supported by EUNIC Berlin cluster members.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Über die Organisator:innen</h2>
                            <p>
                                <span className={styles.underline}>Europeana XX. A Century of Change ist ein Projekt</span>, das durch das Connecting Europe Facility Programm der Europäischen Union kofinanziert wird.
                            </p>
                            <p>
                                Die Europeana XX Subtitle-a-thon Challenge Frankfurt ist eine Zusammenarbeit zwischen dem Projekt, ausgerichtet von einem der Projektpartner - dem DFF - Deutsches Filminstitut & Filmmuseum, unterstützt von Mitgliedern des EUNIC Cluster Berlin.
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                            <div className="d-flex flex-wrap justify-content-center">
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.eunic-berlin.eu/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/eunic.png" alt="EUNIC" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">EU National Institutes for Culture</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.dff.film/en/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/dff.png" alt="Deutsches Filminstitut & Filmmuseum e.V." className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Deutsches Filminstitut & Filmmuseum e.V.</p>
                                    </a>
                                </div>
                            </div> 
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Contact us</h2>
                            <p className={styles.text}>
                                For all your questions: feel free to get in touch with us at <a href="mailto:subtitleathon@dff.film">subtitleathon@dff.film</a> and we will get back to you as soon as possible.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Kontakt</h2>
                            <p className={styles.text}>
                                Bei Fragen: Schreib uns an <a href="mailto:subtitleathon@dff.film">subtitleathon@dff.film</a> und wir melden uns so schnell wie möglich bei dir.
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section> 
            </main>          
        </div>
    )
}

/*<h2 className={styles.blackSubHeader}>Warsaw Assembly videos</h2>
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
            }*/

export default Frankfurt