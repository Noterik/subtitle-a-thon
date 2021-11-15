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

const Rome = () => {
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
                <title>Subtitle-a-thon | Rome Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Rome subtitle-a-thon</h1>
                            <h2 className={styles.subheader}>Europeana XX: Subtitle-a-thon Challenge</h2>  
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="rome">Subtitle-a-thon Challenge Rome</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Join us for the Europeana XX: Subtitle-a-thon Challenge Rome and share with us your language and subtitling skills to <span className="font-italic">"Subtitle the Past, Translate for the Future"</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Luce Cinecittà and The European Union National Institutes for Culture (EUNIC) Cluster Rome are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.whitetext}>
                                The kick-off of the subtitle-a-thon takes place on Saturday, October 23 at 11.00 CEST with a one hour and a half introductory session, and will run online for seven days with a closing session on Friday, October 29 at 17.00 CEST. 
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
                                            23 - 29
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Oct.
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
                                            23 - 29
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Ott.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="rome">Subtitle-a-thon Challenge Rome</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Unisciti a noi per l’Europeana XX: Subtitle-a-thon Challenge di Roma e condividi con noi le tue abilità linguistiche per<span className="font-italic">Sottotitolare il Passato, Tradurre per il Futuro</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Luce Cinecittà e l’European Union National Institute for Culture (EUNIC) sono lieti di invitarti ad una subtitle-a-thon dedicata al patrimonio audiovisivo europeo.
                            </p>
                            <p className={styles.whitetext}>
                                Il lancio della subtitle-a-thon avverrà sabato 23 ottobre alle 11.00 con una sessione introduttiva di un’ora e mezza, e poi proseguirà online per sette giorni con un evento conclusivo che si terrà venerdì 29 ottobre alle 17.00.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/registration">
                                    <div className={styles.button}>
                                        Registrati
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
                                The participants will be subtitling short audiovisual clips coming from Luce archival collection, as well as from other, leading European audiovisual archives, whose content is available on <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                We invite you to:
                            </p>
                            <ul>
                                <li>Create subtitles to a variety of short audiovisual clips, like the Italian newsreels or the Polish cartoons.</li>
                                <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                                <li>At the same time join the community of ‘citizen linguists’ and audiovisual heritage fans.</li>
                                <li>Win a prize (<a href="https://www.lafeltrinelli.it" target="_blank">Feltrinelli</a> gift cards) for becoming one of the best Europeana XX subtitlers!</li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>La competizione</h2>
                            <p>
                                I partecipanti dovranno sottotitolare brevi filmati provenienti dall’archivio Luce e di altri archivi audiovisivi europei, i cui contenuti sono accessibili sul portale <a href="https://europeana.eu" target="_blank">Europeana.eu</a>.
                            </p>
                            <p className="font-weight-bold">
                                Ti invitiamo a:
                            </p>
                            <ul>
                                <li>Creare sottotitoli per brevi clip audiovisive, come i cinegiornali italiani o i cartoni animati polacchi.</li>
                                <li>Provare un nuovo strumento e condividere le tue abilità linguistiche in un ambiente amichevole e divertente.</li>
                                <li>Unirti alla comunità di "cittadini linguisti" e appassionati del patrimonio audiovisivo.</li>
                                <li>Vincere dei premi (carte regalo <a href="https://www.lafeltrinelli.it" target="_blank">Feltrinelli</a>) per il miglior sottotitolista Europeana XX!</li>
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
                                <span className="font-weight-bold">101</span> new subtitles,<br/>
                                <span className="font-weight-bold">19</span> active subtitlers,<br/>
                                <span className="font-weight-bold">5</span> languages,<br/>
                                <span className="font-weight-bold">159 425</span> characters<br/>
                                and <span className="font-weight-bold">177</span> minutes of subtitles!!!<br/><br/>
                                <span className="font-weight-bold">Here are the results of Europeana XX: Subtitle-a-thon Challenge Rome!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                And here are <span className="font-weight-bold">the winners!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                1st prize - 75€ Feltrinelli gift card - <span className="font-weight-bold">Edita Masiulianec</span>
                               
                            </p>
                            <p className={styles.whitetext}>
                                2nd prize - 50€ Feltrinelli gift card - <span className="font-weight-bold">Gaia Isola</span>
                            </p>
                            <p className={styles.whitetext}>
                                3rd prize - 25€ Feltrinelli gift card - <span className="font-weight-bold">Magdalena Marta Golec</span>
                            </p>    
                            <div className={`mt-4 pt-3 mb-4 pb-4 ${styles.progressblock}`}>
                                <p className={styles.leaderboardheader}>Leaderboard</p>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                1
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                Edita Masiulianec
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                11
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                Francesco Giommoni
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                2
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Gaia Isola
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                12
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Selene Prudenziato
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                3
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Magdalena Marta Golec
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                13
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Gaia Cantucci
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                4
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Laura Szablan
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                14
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Karile Mozeryte
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                5
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Federica Alessandrini
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                15
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Katarzyna Maria Borowska Stefanek
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                6
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Dominika Cichocka
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                16
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Angela Baldinu
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                7
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Martina Fares
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                17
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Irene Cazzato
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                8
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Ziembrowicz Katarzyna Weronika
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                18
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Martina Bonsangue
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                9
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Viktorija Fiaeryt
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                19
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Stefania Spinelli
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                10
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Anna Cavazzoni
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                            </div>
                            <p className={styles.whitetext}>
                                The prizes were awarded by the Challenge organisers based on the amount of subtitled characters and quality of the subtitles. <span className="font-weight-bold">Congratulations!</span>
                            </p>
                            <p className={styles.whitetext}>
                                All entrants will receive in their mailboxes a participation certificate.
                            </p>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">Thank you all for your participation</span> in the Europeana XX: Subtitle-a-thon Challenge Rome!
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
                                Annuncio dei vincitori
                            </p>
                            <br/>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">101</span> nuovi sottotitoli,<br/>
                                <span className="font-weight-bold">19</span> sottotitolatori,<br/>
                                <span className="font-weight-bold">5</span> lingue,<br/>
                                <span className="font-weight-bold">159 425</span> caratteri<br/>
                                e <span className="font-weight-bold">177</span> minuti di sottotitoli!!!<br/><br/>
                                <span className="font-weight-bold">Ecco i risultati della Europeana XX: Subtitle-a-thon Challenge Rome!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                Ed ecco i <span className="font-weight-bold">vincitori!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                1° premio - Carta regalo Feltrinelli 75€ - <span className="font-weight-bold">Edita Masiulianec</span>
                            </p>
                            <p className={styles.whitetext}>
                                2° premio - Carta regalo Feltrinelli 50€ - <span className="font-weight-bold">Gaia Isola</span>
                            </p>
                            <p className={styles.whitetext}>
                                3° premio - Carta regalo Feltrinelli 25€ - <span className="font-weight-bold">Magdalena Marta Golec</span>
                            </p>    
                            <div className={`mt-4 pt-3 mb-4 pb-4 ${styles.progressblock}`}>
                                <p className={styles.leaderboardheader}>Classifica</p>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                1
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                Edita Masiulianec
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                11
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                Francesco Giommoni
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                2
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Gaia Isola
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                12
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Selene Prudenziato
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                3
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Magdalena Marta Golec
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                13
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Gaia Cantucci
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                4
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Laura Szablan
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                14
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Karile Mozeryte
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                5
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Federica Alessandrini
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                15
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Katarzyna Maria Borowska Stefanek
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                6
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Dominika Cichocka
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                16
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Angela Baldinu
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                7
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Martina Fares
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                17
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Irene Cazzato
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                8
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Ziembrowicz Katarzyna Weronika
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                18
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Martina Bonsangue
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                9
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Viktorija Fiaeryt
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                19
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Stefania Spinelli
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                                <div className="row pb-2">
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                10
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                            Anna Cavazzoni
                                            </div>
                                            <div className={'col-1'}></div>
                                            <div className={`col-2 my-auto ${styles.leaderboardnumber}`}>
                                                
                                            </div>
                                            <div className={`col-3 align-self-center ${styles.leaderboardparticipant}`}>
                                                
                                            </div>
                                            <div className={'col-1'}></div>
                                </div>
                            </div>
                            <p className={styles.whitetext}>
                                I premi sono stati assegnati dagli organizzatori della Challenge considerando la quantità di caratteri sottotitolati e la qualità dei sottotitoli. <span className="font-weight-bold">Congratulazioni!</span>
                            </p>
                            <p className={styles.whitetext}>
                                Tutti i partecipanti riceveranno nella loro casella di posta un attestato di partecipazione.
                            </p>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">Grazie a tutti per la vostra partecipazione</span> all'Europeana XX: Subtitle-a-thon Challenge Rome!
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
                                We are inviting translation enthusiasts, language teachers, linguists and advanced language students (C1 and above) that are eager to immerse themselves in the wealth of European audiovisual heritage to make it broadly understood by enriching it with subtitles. 
                            </p>
                            <p className="font-weight-bold">
                                So, if you:
                            </p>
                            <ul>
                                <li>speak two or more foreign languages, including Italian, Polish, Irish, Slovakian, Lithuanian  or Turkish *</li>
                                <li>spell, punctuate and use grammar accurately</li>
                                <li>translate the dialogue into the required language sensitively</li>
                                <li>work precisely with text and timing</li>
                            </ul>
                            <p>
                                ...then we are looking for you and challenge you to dedicate to the task at least 4 hours during the week. There is of course no maximum. 
                            </p>
                            <p className="font-italic">
                                * Although knowledge of Italian is not a must to join the subtitle-a-thon, please note that the majority of audiovisual clips available for the event will be coming from Luce’s collection in Italian. The event is eligible only for participants fluent in two or more languages listed above.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Chi può partecipare?</h2>
                            <p>
                                Invitiamo gli appassionati di traduzione, gli insegnanti di lingue, i linguisti e gli studenti di lingue avanzate (C1 o superiori) desiderosi di immergersi nella ricchezza del patrimonio audiovisivo europeo per renderlo più accessibile arricchendolo attraverso i sottotitoli.
                            </p>
                            <p className="font-weight-bold">
                                Quindi, se tu:
                            </p>
                            <ul>
                                <li>parli due o più lingue straniere tra cui l'italiano, il polacco, l’irlandese, il lituano, lo slovacco o il turco *</li>
                                <li>sai sillabare, punteggiare e usare la grammatica in modo corretto</li>
                                <li>sai tradurre un dialogo nella lingua richiesta con sensibilità</li>
                                <li>sai lavorare con precisione col testo e i tempi</li>
                            </ul>
                            <p>
                                ...sei proprio chi stiamo cercando, e ti sfidiamo a dedicare a questa competizione almeno 4 ore durante la settimana. Ovviamente non c'è un limite massimo.
                            </p>
                            <p className="font-italic">
                                * Sebbene la conoscenza dell’italiano non sia obbligatoria per partecipare alla competizione, la maggior parte delle clip audiovisive disponibili per l'evento proverrà dalla collezione dell’archivio Luce in lingua italiana. L'evento è idoneo solo per i partecipanti che parlano fluentemente due o più lingue sopra elencate.
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
                                To join you need to submit the <a href="/registration">registration form</a> no later than <span className="font-weight-bold">October 21, 2021</span>. Registration will be accepted, after an assessment of suitability, on a first come first served basis as availability is limited.
                            </p>
                            <p className="font-weight-bold">
                                IMPORTANT DATES:
                            </p>
                            <p>
                                October 13 - October 21: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p>
                                October 23 - October 29: Subtitle-a-thon
                            </p>
                            <p>
                                October 23 11:00-12:30 CET: opening session
                            </p>
                            <p>
                                October 29 17:00-18:00 CET: closing session
                            </p>
                            <p>
                                November 12: Announcement of winners (on the Subtitle-a-thon website)
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Come puoi partecipare?</h2>
                            <p>
                                Per aderire è necessario <a href="/registration">registrarsi online entro</a> e non oltre il <span className="font-weight-bold">21 ottobre 2021</span>. La registrazione sarà accettata, previa valutazione di idoneità, in ordine di arrivo in quanto la disponibilità di posti è limitata.
                            </p>
                            <p className="font-weight-bold">
                                APPUNTAMENTI IMPORTANTI:
                            </p>
                            <p>
                                13 ottobre - 21 ottobre: Aperte le iscrizioni
                            </p>
                            <p>
                                23 ottobre - 29 ottobre: Subtitle-a-thon
                            </p>
                            <p>
                                23 ottobre 11:00-12:30: sessione di apertura
                            </p>
                            <p>
                                29 ottobre 17:00-18:00: sessione di chiusura
                            </p>
                            <p>
                                12 novembre: Annuncio dei vincitori (sul sito Subtitle-a-thon)
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
                            The Europeana XX Subtitle-a-thon Challenge Rome is a collaboration between the project, hosted by one of the project partners - Cinecittà s.p.a. , supported by EUNIC Rome cluster members:
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>A proposito degli organizzatori</h2>
                            <p>
                                <span className={styles.underline}>Europeana XX. A Century of Change</span> è un progetto cofinanziato dal Connecting Europe Facility Program dell'Unione Europea.
                            </p>
                            <p>
                                La Europeana XX Subtitle-a-thon Challenge Rome è una collaborazione tra il progetto, e uno dei suoi partner, Cinecittà s.p.a., e supportato dai membri del cluster EUNIC di Roma:
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
                                    <a href="https://cinecitta.com/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/luce.png" alt="Cinecittà" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Cinecittà</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://instytutpolski.pl/roma/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/ip_roma.jpg" alt="Istituto Polacco di Roma" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Istituto Polacco di Roma</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.facebook.com/IstitutoSlovaccoRoma/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/si_rim.png" alt="Istituto Slovacco a Roma" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Istituto Slovacco a Roma</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://roma.yee.org.tr/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/yeni.jpg" alt="Centro Culturale Turco a Roma" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Centro Culturale Turco a Roma</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://english.lithuanianculture.lt/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/lci.png" alt="Lithuanian Culture Institute" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Lithuanian Culture Institute</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.dfa.ie/irish-embassy/italy/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/embitaly.png" alt="Embassy of Ireland | Italy" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Embassy of Ireland | Italy</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.eunicglobal.eu/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/eunic.png" alt="The European Union National Institutes for Culture (EUNIC)" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">The European Union National Institutes for Culture (EUNIC)</p>
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
                                For all your questions: feel free to get in touch with us at <a href="mailto:subtitleathon@cinecittaluce.it">subtitleathon@cinecittaluce.it</a> and we will get back to you as soon as possible.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}></h2>
                            <p className={styles.text}> 
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

export default Rome