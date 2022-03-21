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

const Caserta = () => {
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
                <title>Subtitle-a-thon | Caserta Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Caserta subtitle-a-thon</h1>
                            <h2 className={styles.subheader}>Europeana Subtitled: Subtitle-a-thon Challenge</h2>  
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="rome">Subtitle-a-thon Challenge from Liceo Manzoni, Caserta</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Join us for the Subtitle-a-thon Challenge of Liceo Manzoni, Caserta and share with us your language and subtitling skills to <span className="font-italic">"Subtitle the Past, Translate for the Future"</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Archivio Luce - Cinecittà and Liceo Manzoni Caserta are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.whitetext}>
                                The presentation of the subtitle-a-thon takes place on Friday, March 4 at 11.00 CEST with a one hour and a half introductory session, and will run online for four days from the 14th to the 18th of March with a final  award session on Tuesday, April 12.
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
                                            14 - 18
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Mar.
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
                                            14 - 18
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Mar.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="rome">Subtitle-a-thon Challenge from Liceo Manzoni, Caserta</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Unisciti a noi per Subtitle-a-thon Challenge presso il Liceo Manzoni di Caserta e condividi con noi le tue abilità linguistiche per <span className="font-italic">Sottotitolare il Passato, Tradurre per il Futuro</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Archivo Luce - Cinecittà e il Liceo Manzoni di Caserta sono lieti di invitarti ad una subtitle-a-thon dedicata al patrimonio audiovisivo.
                            </p>
                            <p className={styles.whitetext}>
                                Il lancio della subtitle-a-thon avverrà venerdì 4 marzo alle 11.00 con una sessione introduttiva di un’ora e mezza, e poi proseguirà online per quattro giorni dal 14 al 18 marzo, con una premiazione finale che si terrà giovedì 12 aprile.
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
                                The participants will be subtitling short audiovisual clips coming from Luce archival collection, present on <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                We invite you to:
                            </p>
                            <ul>
                                <li>Create subtitles to a variety of short audiovisual clips, like newsreels or short documentaries.</li>
                                <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                                <li>At the same time join the community of ‘citizen linguists’ and audiovisual heritage fans.</li>
                                <li>Win a prize for becoming the best subtitler!</li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>La competizione</h2>
                            <p>
                                I partecipanti dovranno sottotitolare brevi filmati provenienti dall’Archivio Luce, i cui contenuti sono accessibili anche sul portale <a href="https://europeana.eu" target="_blank">Europeana.eu</a>.
                            </p>
                            <p className="font-weight-bold">
                                Ti invitiamo a:
                            </p>
                            <ul>
                                <li>Creare sottotitoli per brevi clip audiovisivi, come i cinegiornali o i documentari dell’Archvio Luce </li>
                                <li>Provare un nuovo strumento e condividere le tue abilità linguistiche in un ambiente amichevole e divertente.</li>
                                <li>Unirti alla comunità di "cittadini linguisti" e appassionati del patrimonio audiovisivo.</li>
                                <li>Vincere dei premi e diventare il miglior sottotitolista.</li>
                            </ul>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>The awards</h2>
                            <p>
                                The winners of the Subtitle-a-thon Challenge Caserta will receive  prizes and all entrants will receive a participation certificate. The jury will be composed by language teachers from Liceo Manzoni and by Letizia Cinganotto, a researcher in INDIRE and CLIL expert.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>I premi</h2>
                            <p>
                                I vincitori della dell' Subtitle-a-thon Challenge di Caserta riceveranno dei premi e per tutti i partecipanti un certificato di partecipazione. La giuria sarà composta da insegnanti di lingua del Liceo Manzoni e da Letizia Cinganotto di Indire.
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Who can take part?</h2>
                            <p>
                                We are inviting the students of Liceo Manzoni Caserta that are eager to immerse themselves in the wealth of European audiovisual heritage to make it broadly understood by enriching it with subtitles. 
                            </p>
                            <p className="font-weight-bold">
                                So, if you:
                            </p>
                            <ul>
                                <li>speak one or more foreign languages, including English, Spanish, German or French</li>
                                <li>spell, punctuate and use grammar accurately</li>
                                <li>translate the dialogue into the required language sensitively</li>
                                <li>work precisely with text and timing</li>
                            </ul>
                            <p>
                                ...then we are looking for you and challenge you to dedicate to the task at least 4 hours during the week. There is of course no maximum. 
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Chi può partecipare?</h2>
                            <p>
                                Gli studenti dell’indirizzo Linguistico del Liceo Manzoni di Caserta desiderosi di immergersi nella ricchezza del patrimonio audiovisivo europeo per renderlo più accessibile arricchendolo attraverso i sottotitoli.
                            </p>
                            <p className="font-weight-bold">
                                Quindi, se tu:
                            </p>
                            <ul>
                                <li>parli una o più lingue straniere tra cui l’Inglese, il Francese, lo Spagnolo , ed il Tedesco</li>
                                <li>sai sillabare, punteggiare e usare la grammatica in modo corretto;</li>
                                <li>sai tradurre un dialogo nella lingua richiesta con una certa sensibilità;</li>
                                <li>sai lavorare con precisione col testo e i tempi;</li>
                            </ul>
                            <p>
                                ...sei proprio chi stiamo cercando, e ti sfidiamo a dedicare almeno 4 ore durante la settimana a questa competizione. Ovviamente non c'è un limite massimo di tempo.
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
                                To join you need to submit the <a href="/registration">registration form</a> no later than <span className="font-weight-bold">March 7, 2022</span>. Registration will be accepted, after an assessment of suitability, on a first come first served basis as availability is limited.
                            </p>
                            <p className="font-weight-bold">
                                IMPORTANT DATES:
                            </p>
                            <p>
                                March 4 - March 11: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p>
                                March 4, 11:00-13:00 CET: training and opening session
                            </p>
                            <p>
                                March 14 - March 18: Subtitle-a-thon
                            </p>
                            <p>
                                April 12: Announcement of winners, awards ceremony 
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Come puoi partecipare?</h2>
                            <p>
                                Per aderire è necessario <a href="/registration">registrarsi online entro</a> e non oltre il <span className="font-weight-bold">7 marzo 2022</span>. La registrazione sarà accettata, previa valutazione di idoneità.
                            </p>
                            <p className="font-weight-bold">
                                APPUNTAMENTI IMPORTANTI:
                            </p>
                            <p>
                                7 marzo - 11 marzo: iscrizioni
                            </p>
                            <p>
                                14 marzo - 18 marzo: Subtitle-a-thon
                            </p>
                            <p>
                                12 aprile: Annuncio dei vincitori, cerimonia di premiazione
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
                                <span className={styles.underline}>Europeana Subtitled is a project</span>, co-financed by the Connecting Europe Facility Programme of the European Union.
                            </p>
                            <p>
                            The Subtitle-a-thon Challenge Caserta is a collaboration between the project, represented by one of the project partners, Cinecittà s.p.a., and supported by Liceo Manzoni Caserta.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>A proposito degli organizzatori</h2>
                            <p>
                                <span className={styles.underline}>Europeana Subtitled</span> è un progetto cofinanziato dal Connecting Europe Facility Program dell'Unione Europea.
                            </p>
                            <p>
                                Subtitle-a-thon Challenge Caserta è una collaborazione tra il progetto, e uno dei suoi partner, Cinecittà s.p.a., e supportato dal Liceo Manzoni di Caserta.
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
                                    <a href="https://www.liceomanzonicaserta.edu.it/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/liceo-manzoni.png" alt="Liceo Manzoni di Caserta" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Liceo Manzoni di Caserta</p>
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

export default Caserta