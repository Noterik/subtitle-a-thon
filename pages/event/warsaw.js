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

const Warsaw = () => {
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
                <title>Subtitle-a-thon | Warsaw Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Warsaw subtitle-a-thon</h1>
                            <h2 className={styles.subheader}>Europeana XX: Subtitle-a-thon Challenge</h2>  
                        </div>
                    </div>
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
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimageodd}>
                                <div className={styles.eventimagedatewrapper}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockleft}`}>
                                        <span className={styles.eventdateblockdates}>
                                            12-18
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            June
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={`d-none d-lg-block col-lg-6 ${styles.purplebackground}`}> 
                            <div className={styles.eventimageodd}>
                                <div className={`${styles.eventimagedatewrapper} justify-content-end`}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockright}`}>
                                        <span className={styles.eventdateblockdates}>
                                            12-18
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            czerwca
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="warsaw">Subtitle-a-thon Challenge Warsaw</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Weź udział w Europeana XX: Subtitle-a-thon Challenge Warsaw! Podziel się z nami swoimi zdolnościami językowymi i stwórz napisy do archiwalnych materiałów audiowizualnych na platformie Europeana.eu.
                            </p>
                            <p className={styles.whitetext}>
                                Filmoteka Narodowa – Instytut Audiowizualny (FINA) oraz Warszawski odział Stowarzyszenia Narodowych Instytutów Kultury Unii Europejskiej (EUNIC) mają przyjemność zaprosić na subtitle-a-thon oparty na dziedzictwie audiowizualnym.
                            </p>
                            <p className={styles.whitetext}>
                                Wydarzenie rozpocznie się w sobotę 12 czerwca o godz. 11:00 od dwugodzinnej sesji wprowadzającej i będzie trwać online przez 7 dni. Sesja zamykająca odbędzie się w piątek 18 czerwca o godz. 17:00. 
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
                                The participants will be subtitling short audiovisual clips coming from FINA’s archival collection, as well as from other, leading European audiovisual archives, whose content is available on <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                We invite you to:
                            </p>
                            <ul>
                                <li>Create subtitles to a variety of short audiovisual clips, like the Polish cartoons or Italian newsreels.</li>
                                <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                                <li>At the same time join the community of ‘citizen linguists’ and audiovisual heritage fans.</li>
                                <li>Win a prize (Empik gift cards) for becoming the best Europeana XX subtitler!</li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Wyzwanie</h2>
                            <p>
                                Uczestnicy będą tworzyć napisy do krótkich klipów audiowizualnych pochodzących z kolekcji FINA oraz innych archiwalnych materiałów audiowizualnych znajdujących się na platformie <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                Podczas subtitle-a-thonu uczestnicy będą mogli:
                            </p>
                            <ul>
                                <li>tworzyć napisy do różnorodnych krótkich materiałów audiowizualnych, m.in. polskich animacji i włoskich kronik filmowych</li>
                                <li>testować w przyjaznej atmosferze nowe narzędzia oraz kompetencje językowe</li>
                                <li>dołączyć do społeczności „obywatelskich tłumaczy” i miłośników dziedzictwa audiowizualnego</li>
                                <li>zostać najlepszym tłumaczem projektu Europeana XX i wygrać nagrody (karty podarunkowe Empik)!</li>
                            </ul>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>

                <section className="container-fluid">
                <div className="row pt-4">
                        <div className={`col-12 col-lg-6 pt-5 pb-5 pl-5 pr-5 ${styles.purplebackground}`}>
                            <p className={`${styles.eventheader}`}>
                                Announcement of awards
                            </p>
                            <br/>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">5 locations</span> (France, Belgium, Poland, Greece/Ukraine, Italy),<br/>
                                <span className="font-weight-bold">113</span> new subtitles,<br/>
                                <span className="font-weight-bold">23</span> active subtitlers,<br/>
                                <span className="font-weight-bold">7</span> languages,<br/>
                                <span className="font-weight-bold">390 043</span> characters<br/>
                                and <span className="font-weight-bold">458</span> minutes of subtitles!!!<br/><br/>
                                <span className="font-weight-bold">Here are the results of Europeana XX: Subtitle-a-thon Challenge Warsaw!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                And here are <span className="font-weight-bold">the winners!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                1st prize - 300 PLN gift card to Empik.com – <span className="font-weight-bold">Dominika Litwin</span>
                            </p>
                            <p className={styles.whitetext}>
                                2nd prize - 200 PLN gift card to Empik.com - <span className="font-weight-bold">Katarzyna Książek</span>
                            </p>
                            <p className={styles.whitetext}>
                                3rd prize - 150 PLN gift card to Empik.com - <span className="font-weight-bold">Natalia Winiarska</span>
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
                                                Dominika Litwin
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
                                                Katarzyna Książek
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
                                                Natalia Winiarska
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
                                <span className="font-weight-bold">Thank you all for your participation</span> in the Europeana XX: Subtitle-a-thon Challenge Warsaw!
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
                            Ogłoszenie nagród
                            </p>
                            <br/>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">5 lokalizacji</span> (Francja, Belgia, Polska, Grecja/Ukraina, Włochy),<br/>
                                <span className="font-weight-bold">113</span> nowych napisów,<br/>
                                <span className="font-weight-bold">23</span>  tworzących napisy,<br/>
                                <span className="font-weight-bold">7</span> języków,<br/>
                                <span className="font-weight-bold">390 043</span> znaków<br/>
                                oraz <span className="font-weight-bold">458</span> minuty napisów !!!<br/><br/>
                                <span className="font-weight-bold">Oto wyniki Europeana XX: Subtitle-a-thon Challenge Warsaw!</span> 
                            </p>
                            <p className={styles.whitetext}>
                                A oto <span className="font-weight-bold">zwycięzcy!</span><br/>
                            </p>
                            <p className={styles.whitetext}>
                                I nagroda - karta podarunkowa 300 zł na Empik.com – <span className="font-weight-bold">Dominika Litwin</span>
                            </p>
                            <p className={styles.whitetext}>
                                II nagroda - karta podarunkowa 200 zł do Empik.com -<span className="font-weight-bold">Katarzyna Książek</span>
                            </p>
                            <p className={styles.whitetext}>
                                III nagroda - karta podarunkowa 150 zł do Empik.com - <span className="font-weight-bold">Natalia Winiarska</span>
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
                                                Dominika Litwin
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
                                                Katarzyna Książek
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
                                                Natalia Winiarska
                                            </div>
                                            <div className={'col-1 col-lg-2'}></div>
                                </div>
                            </div>
                            <p className={styles.whitetext}>
                                Nagrody zostały przyznane przez organizatorów w oparciu o ilość znaków oraz jakość opracowanych napisów.<span className="font-weight-bold">Gratulacje!</span>
                            </p>
                            <p className={styles.whitetext}>
                                Wszyscy uczestnicy otrzymają e-mailem certyfikat uczestnictwa.
                            </p>
                            <p className={styles.whitetext}>
                                <span className="font-weight-bold">Dziękujemy wszystkim za udział</span> w Europeana XX: Subtitle-a-thon Challenge Warsaw!
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
                                <li>speak one or many foreign languages including Dutch, English, French, German, Polish, Portugueese, Spanish and Romanian, *</li>
                                <li>spell, punctuate and use grammar accurately</li>
                                <li>translate the dialogue into the required language sensitively</li>
                                <li>work precisely with text and timing</li>
                            </ul>
                            <p>
                                ...then we are looking for you and challenge you to dedicate to the task at least 4 hours during the week. There is of course no maximum. 
                            </p>
                            <p className="font-italic">
                                * Although knowledge of Polish is not a must to join the subtitle-a-thon, please note that the majority of audiovisual clips available for the event will be coming from FINA’s collection in Polish. 
                                The event is eligible only for participants fluent in two or more languages listed above.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Kto może wziąć udział?</h2>
                            <p>
                            Organizatorzy zapraszają entuzjastów tłumaczeń, nauczycieli języków obcych, językoznawców i osoby uczące się języków obcych na poziomie C1 i wyższym, które chcą zanurzyć się w bogactwo europejskiego dziedzictwa audiowizualnego i dzięki tłumaczeniom udostępnić je nowym odbiorcom.  
                            </p>
                            <p className="font-weight-bold">
                                Jeśli…
                            </p>
                            <ul>
                                <li>znasz jeden lub kilka języków obcych w tym holenderski, angielski, francuski, niemiecki, polski, portugalski, hiszpański i rumuński*</li>
                                <li>dobrze znasz gramatykę, interpunkcję i pisownię tych języków</li>
                                <li>potrafisz dobrze przetłumaczyć dialogi</li>
                                <li>potrafisz precyzyjnie pracować z tekstem i jego synchronizacją w czasie</li>
                            </ul>
                            <p>
                                ... dołącz do subtitle-a-thon!
                            </p>
                            <p className="font-italic">
                                * Znajomość polskiego nie jest konieczna, żeby dołączyć do subtitle-a-thon. Należy jednak pamiętać, że większość dostępnych materiałów audiowizualnych pochodzących z kolekcji FINA jest w języku polskim. Wydarzenie jest przeznaczone tylko dla uczestników biegle posługujących się co najmniej dwoma językami wymienionymi powyżej.
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
                                To join you need to submit the registration form no later than <span className="font-weight-bold">June 10, 2021</span>. Registration will be accepted on a first come first served basis as availability is limited.
                            </p>
                            <p className="font-weight-bold">
                                IMPORTANT DATES:
                            </p>
                            <p>
                                May 20 - June 10: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p>
                                June 12 - June 18: Subtitle-a-thon
                            </p>
                            <p>
                                June 12 11:00-13:00 CET: opening session
                            </p>
                            <p>
                                June 18 17:00-18:00 CET: closing session
                            </p>
                            <p>
                                June 25: Announcement of Winners (on the subtitle-a-thon website)
                            </p>
                            <p>
                                The opening and closing sessions will be held in English with Polish simultaneous translation.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Jak dołączyć?</h2>
                            <p>
                                Należy do 10 czerwca wypełnić formularz rejestracyjny. Liczba miejsc jest limitowana. O udziale będzie decydowała kolejność zgłoszeń. 
                            </p>
                            <p className="font-weight-bold">
                                Ważne daty:
                            </p>
                            <p>
                                20 maja - 10 czerwca - rejestracja (uczestnicy otrzymają potwierdzenie w ciągu 5 dni od zgłoszenia)
                            </p>
                            <p>
                                12-18 czerwca - Subtitle-a-thon
                            </p>
                            <p>
                                12 czerwca, godz. 11-13 - sesja otwierająca
                            </p>
                            <p>
                                18 czerwca, godz. 17-18 - sesja zamykająca
                            </p>
                            <p>
                                25 czerwca - ogłoszenie zwycięzców (na stronie subtitle-a-thonu)
                            </p>
                            <p>
                                Sesja otwarcia i zamknięcia odbędą się w języku angielskim i będą symultanicznie tłumaczone na język polski.
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
                                The Europeana XX Subtitle-a-thon Challenge Warsaw is a collaboration between the project, hosted by one of the project partners - the National Film Archive - Audiovisual Institute, supported by EUNIC Warsaw cluster  members:
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>O organizatorach</h2>
                            <p>
                                Europeana XX. A Century of Change to projekt współfinansowany w ramach instrumentu finansowego Unii Europejskiej “Łącząc Europę”.
                            </p>
                            <p>
                                Europeana XX Subtitle-a-thon Challenge Warsaw jest wydarzeniem organizowanym w ramach projektu, którego gospodarzem jest jeden z partnerów - Filmoteka Narodowa - Instytut Audiowizualny, wspierany przez członków klastra EUNIC Warszawa:
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
                                    <a href="https://austria.org.pl/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/austrian.png" alt="Austrian Cultural Forum" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Austrian Cultural Forum</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.britishcouncil.pl/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/britishcouncil.png" alt="British Council" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">British Council</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="http://www.camoes.pl/?lang=pl" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/camoes.gif" alt="Camões Institute" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Camões Institute</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.netherlandsandyou.nl/your-country-and-the-netherlands/poland" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/kingdomnetherlands.png" alt="Embassy of the Kingdom of the Netherlands" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Embassy of the Kingdom of the Netherlands</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://eunic.pl/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/eunic.png" alt="EUNIC" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">EU National Institutes for Culture</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://fina.gov.pl" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/fina.png" alt="The National Film Archive - Audiovisual Institute" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">The National Film Archive - Audiovisual Institute</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.institutfrancais.pl/fr" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/pologne.png" alt="Institut français de Pologne" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Institut français de Pologne</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://varsovia.cervantes.es/pl/default.shtm" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/cervantes.jpg" alt="Instituto Cervantes" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Instituto Cervantes</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.icr.ro/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/icr.jpg" alt="Romanian Cultural Institute" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Romanian Cultural Institute</p>
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
                                For all your questions: feel free to get in touch with us at <a href="mailto:subtitleathon@fina.gov.pl">subtitleathon@fina.gov.pl</a> and we will get back to you as soon as possible.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Kontakt</h2>
                            <p className={styles.text}>
                                W przypadku pytań zachęcamy do kontaktu z nami pod adresem <a href="mailto:subtitleathon@fina.gov.pl">subtitleathon@fina.gov.pl</a>. Będziemy się starać odpowiadać na nie na bieżąco.
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

export default Warsaw