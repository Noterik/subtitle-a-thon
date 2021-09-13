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

const Amsterdam = () => {
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
                <title>Subtitle-a-thon | Amsterdam Subtitle-a-thon</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="event"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Amsterdam subtitle-a-thon</h1>
                            <h2 className={styles.subheader}>Europeana XX: Subtitle-a-thon Challenge</h2>  
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="warsaw">Subtitle-a-thon Challenge Amsterdam</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Join the <span className="font-italic">Europeana XX: Subtitle-a-thon</span>! Try your hand at subtitling Europe’s audiovisual heritage – from early Dutch newsreels and clips on arts and culture – in Dutch and English, and make it accessible to other people. Our motto: <span className="font-italic">"Subtitle the Past, Translate for the Future"</span>.
                            </p>
                            <p className={styles.whitetext}>
                                The Netherlands Institute for Sound and Vision cordially invites all language and film culture buffs to participate in our online event!
                            </p>
                            <p className={styles.whitetext}>
                                Subtitle-a-thon running time: September 26 - October 2, 2021.<br/>
                                Kick off event: Sunday, September 26 from 3:00 p.m. to 5:00 p.m. on Zoom.<br/>
                                Wrap up event: Saturday, October 2 at 5:00 p.m. on Zoom<br/>
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
                                            26 - 2
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Sept. / Oct.
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
                                            26 - 2
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            Sept. / Okt.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-1 ${styles.purplebackground}`}></div>
                        <div className={`col-10 col-lg-4 pt-5 ${styles.purplebackground}`}>
                            <p className={styles.eventheader}>
                            <a name="warsaw">Subtitle-a-thon Challenge Amsterdam</a>  
                            </p>
                            <p className={styles.whitetext}>
                                Doe mee met de <span className="font-italic">Europeana XX: Subtitle-a-thon</span>! Van vroege Nederlandse journaals tot clips over kunst en cultuur, probeer het audiovisuele erfgoed van Europa te ondertitelen in het Nederlands/Vlaams en Engels, en maak het toegankelijk voor anderen. Onze motto: <span className="font-italic">"Het Verleden Ondertitelen, Vertalen voor de Toekomst”</span>.
                            </p>
                            <p className={styles.whitetext}>
                                Het Nederlands Instituut voor Beeld en Geluid nodigt alle taal- en film liefhebbers van harte uit om deel te nemen aan ons online evenement!
                            </p>
                            <p className={styles.whitetext}>
                                Subtitle-a-thon looptijd: september 26- october 2, 2021.<br/>
                                Kick off event: zondag, 26 september van 15:00 u. tot 17:00 u. via Zoom.<br/>
                                Wrap up event: zaterdag, 2 october om 17:00 u. via Zoom<br/>
                            </p>
                            <p className={styles.whitetext}>
                                We kijken er naar uit om je te zien! Na inschrijving ontvang je meer informatie.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/registration">
                                    <div className={styles.button}>
                                        Registreren
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
                            The participants will be subtitling short clips coming from the Netherlands Institute for Sound and Vision archival collection, as well as from other leading European audiovisual archives, whose content is available on <a href="https://europeana.eu" target="_blank">Europeana.eu</a>. 
                            </p>
                            <p className="font-weight-bold">
                                We invite you to:
                            </p>
                            <ul>
                                <li>Create subtitles for a variety of short audiovisual clips, such as (but not limited to) newsreels and clips about art and culture.</li>
                                <li>Test a new tool and your language skills in a friendly and fun environment.</li>
                                <li>At the same time join the community of language enthusiasts and audiovisual heritage fans.</li>
                                <li>Win a prize (<a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a> gift cards) for becoming one of the best Europeana XX subtitlers!</li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>De uitdaging</h2>
                            <p>
                            De deelnemers zullen korte clips ondertitelen die afkomstig zijn uit de archiefcollectie van het Nederlands Instituut voor Beeld en Geluid, en andere toonaangevende Europese audiovisuele archieven, waarvan de inhoud beschikbaar is op <a href="https://europeana.eu" target="_blank">Europeana.eu</a>.
                            </p>
                            <p className="font-weight-bold">
                                Wij nodigen jullie uit om:
                            </p>
                            <ul>
                                <li>Maak ondertitels voor diverse korte audiovisuele clips, zoals (maar niet beperkt tot) korte documentaires, journaals en tv programma's over kunst en cultuur.</li>
                                <li>Test een nieuwe tool en je taalvaardigheid in een vriendelijke en leuke omgeving.</li>
                                <li>Word tegelijkertijd lid van de gemeenschap van taal en audiovisueel erfgoed liefhebbers.</li>
                                <li>Win een prijs (ecomondo of bol.com tegoedbon) om een ​​van de beste Europeana XX-ondertitelaars te worden!</li>
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
                            <p>The winners of the Europeana XX Subtitle-a-thon Challenge Amsterdam will receive online gift prizes and all entrants will receive a participation certificate.</p>
                            <p>Prizes will be awarded online by the organisers:</p>
                            <ul>
                                <li>1st prize - 75 Euro gift card to <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                                <li>2nd prize - 50 Euro gift card to <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                                <li>3rd prize - 25 Euro gift card to <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                            </ul>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>De prijzen</h2>
                            <p>De winnaars van de Europeana XX Subtitle-a-thon Uitdaging Amsterdam ontvangen online cadeau prijzen en alle deelnemers ontvangen een deelnamecertificaat.</p>
                            <p>De organisatoren zullen online de prijzen toekennen:</p>
                            <ul>
                                <li>1e prijs - 75 Euro cadeau bon van <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                                <li>2e prijs - 50 Euro cadeau bon van <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                                <li>3e prijs - 25 Euro cadeau bon van <a href="https://www.ecomondo.nl/" target="_blank">ecomondo</a></li>
                            </ul>
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
                                We are inviting translation enthusiasts and advanced language students (C1 and above) that are eager to immerse themselves in the wealth of European audiovisual heritage to make it broadly understood by enriching it with subtitles.
                            </p>
                            <p className="font-weight-bold">
                                So, if you:
                            </p>
                            <ul>
                                <li>Speak Dutch/Flemish and English</li>
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
                            <h2 className={styles.eventheaderblack}>Wie kan deelnemen?</h2>
                            <p>
                                We nodigen vertaald enthousiastelingen en gevorderde taalstudenten (C1 en hoger) uit die zich graag willen onderdompelen in de rijkdom van het Europese audiovisuele erfgoed om het breed te begrijpen door het te verrijken met ondertitels.
                            </p>
                            <p className="font-weight-bold">
                                Dus als je:
                            </p>
                            <ul>
                                <li>Nederlands/Vlaams en Engels spreekt</li>
                                <li>spelling, interpunctie en grammatica nauwkeurig gebruikt</li>
                                <li>de dialoog gevoelig in de gewenste taal vertaald</li>
                                <li>een goed gevoel voor tekst en timing hebt</li>
                                <li>in staat bent om minimaal 4 uur per week aan de taak te besteden</li>
                            </ul>
                            <p>
                                ...dan zijn wij op zoek naar jou!
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
                                To join you need to submit the <a href="/registration">registration form</a> no later than <span className="font-weight-bold">Thursday, September 23, 2021</span>. Registration will be accepted on a first come first served basis as availability is limited.
                            </p>
                            <p className="font-weight-bold">
                                IMPORTANT DATES:
                            </p>
                            <p>
                                September 6 - September 23: Registration open, (participation will be confirmed within 5 days)
                            </p>
                            <p>
                                September 26 -  October 2: Subtitle-a-thon
                            </p>
                            <p>
                                September 26 15:00-17:00 CEST: Kick off
                            </p>
                            <p>
                                October 2 17:00-18:00 CEST: Wrap up
                            </p>
                            <p>
                                October 14: Announcement of Winners (on the subtitle-a-thon website)
                            </p>
                            <p>
                                The opening and closing sessions will be held in English.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Hoe kunt u deelnemen?</h2>
                            <p>
                                Om deel te nemen, moet je het <a href="/registration">registratieformulier</a> uiterlijk <span className="font-weight-bold">donderdag 23 september 2021</span> indienen. Registratie wordt geaccepteerd op basis van wie het eerst komt,, aangezien de beschikbaarheid beperkt is.
                            </p>
                            <p className="font-weight-bold">
                                BELANGRIJKE DATA:
                            </p>
                            <p>
                                6 september  - 23 september:  Inschrijving open (deelname wordt binnen 5 dagen bevestigd)
                            </p>
                            <p>
                                26 september  - 2 oktober: Subtitle-a-thon
                            </p>
                            <p>
                                26 september 15:00-17:00 CEST: Kick off
                            </p>
                            <p>
                                2 oktober 17:00-18:00 CEST: Wrap up/afronding
                            </p>
                            <p>
                                14 oktober: Bekendmaking van de winnaars (op de subtitle-a-thon website)
                            </p>
                            <p>
                                De openings- en sluitings sessies worden in het Engels gehouden.
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
                                The Europeana XX Subtitle-a-thon Challenge Amsterdam is a collaboration between the project, hosted by one of the project partners - the Netherlands Institute for Sound and Vision.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Over de organisatoren</h2>
                            <p>
                                <span className={styles.underline}>Europeana XX. A Century of Change is een project</span>, dat medegefinanceerd is door de Connecting Europe Facility Programme van de Europese Unie.
                            </p>
                            <p>
                                De Europeana XX Subtitle-a-thon Uitdaging Amsterdam is een samenwerking tussen het project, georganiseerd door een van de projectpartners - het Nederlands Instituut voor Beeld en Geluid.
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
                                    <a href="https://www.beeldengeluid.nl" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/nisv.png" alt="Sound and Vision" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Sound and Vision</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://www.universiteitleiden.nl/en/humanities/leiden-university-centre-for-linguistics" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/ul_cfl.png" alt="Leiden University Centre for Linguistics" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">Leiden University Centre for Linguistics</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://eunic-netherlands.eu/" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/eunic.png" alt="The European Union National Institutes for Culture (EUNIC)" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">The European Union National Institutes for Culture (EUNIC)</p>
                                    </a>
                                </div>
                                <div className={styles.partnerwrapper}>
                                    <a href="https://edl.ecml.at/Home/tabid/1455/language/en-GB/Default.aspx" target="_blank" className={styles.link}>
                                        <div className={styles.partner}>
                                            <img src="/partner/edl.png" alt="European Day of Languages" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                        </div>
                                        <p className="font-weight-bold text-break pt-2">European Day of Languages</p>
                                    </a>
                                </div>
                            </div> 
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row pt-1 pb-4">
                        <div className="col-1"></div>
                        <div className="col-10">
                            <p className="text-center">
                                The Subtitle-a-thon will be kicked-off on the <a href="https://edl.ecml.at/Home/tabid/1455/language/en-GB/Default.aspx" target="_blank">European Day of Languages</a> / De Subtitle-a-thon gaat van start op de <a href="https://edl.ecml.at/Home/tabid/1455/language/nl-NL/Default.aspx" target="_blank">Europese Dag van de Talen</a>.
                            </p>
                            <img src="/partner/edl-banner.jpg" alt="European Day of Languages banner" width="100%" height="100%" className="mw-100" style={{objectFit: 'contain'}}/>
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
                                For all your questions: feel free to get in touch with us at <a href="mailto:subtitles@euscreen.eu">subtitles@euscreen.eu</a> and we will get back to you as soon as possible. Or you can call: <a href="tel:0031610038208">+31 610 038 208</a>
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5">
                            <h2 className={styles.eventheaderblack}>Neem contact op</h2>
                            <p className={styles.text}>
                                Voor al je vragen: neem gerust contact met ons op via <a href="mailto:subtitles@euscreen.eu">subtitles@euscreen.eu</a> en we zullen zo snel mogelijk je vragen beantwoorden. Of bel: <a href="tel:0031610038208">+31 610 038 208</a>
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

export default Amsterdam