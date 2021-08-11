import { useEffect, useState } from "react"
import Head from 'next/head'
import NavigationBar from '../components/NavigationBar'
import { useRouter } from "next/router"
import Loader from 'react-loader-spinner';
import styles from "../styles/Event.module.css"
const languages = require('../i18n/lang.json');
import { useForm, FormProvider } from "react-hook-form" 
import { validate } from "email-validator";

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
                
                <button
                        type="submit"
                        className={styles.submitbutton}
                        disabled={!formState.isValid}
                >
                    Submit        
                </button>
                </form>
            </FormProvider>
        </div>
    )
};

const ItemList = ({ items, eventId }) => {
    return (
        <div className="row w-100">
            <div className="col-12">{items.title}</div>
            {items.items && items.items.map((i, key) => {  
                return (
                <div className="col-3" key={key}>
                    <img src={i.edmPreview} className={styles.itemimage} />
                    <div>
                        {i.title[0]}
                    </div>
                    <AvailableLanguages eventId={eventId} itemId={i.id} />
                </div>)
            })}
        </div>
    )
};

/*const ItemListVideos = ({ items }) => {
    items.items && items.items.map((i, key) => {
        var container = "#item"+key;
        var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
        new EuropeanaMediaPlayer(container, videoObj);
    });
}*/

const Event = () => {
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ items, setItems ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ eventid, setEventId ] = useState("");
    const router = useRouter();
    const { query } = router;

    useEffect(() => {
        if(!router.isReady) return;

        async function fetchData() {
            let id = "";
            if (query.id) {
                id = query.id;
                setEventId(id);
            }

            fetch(apiUrl+"/event/list/"+id,
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

            //var container = document.body;
            //var videoObj = { manifest : "https://iiif.europeana.eu/presentation/2051906/data_euscreenXL_http___openbeelden_nl_media_9972/manifest?format=3" };
            //new EuropeanaMediaPlayer(container, videoObj);
        }

        fetchData();
    }, [router.isReady]);

    /*<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.core.css"></link>
    <link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.1/themes/base/jquery.ui.slider.css"></link>
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" type="text/javascript"></script>
    <script src="https://code.jquery.com/ui/1.10.1/jquery-ui.min.js" type="text/javascript"></script>
    <script src="https://unpkg.com/@europeana/media-player@0.7.6/dist/europeana-media-player.min.js"></script>
    */

    return (
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Event</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />

                
            </Head>

            <NavigationBar page="event"/>

            {
                (() => {
                    if (waitingForContent) {
                        return (
                            <Loader type="Oval" className={styles.loaderIcon}/>
                        )
                    } else if (error === null) {
                        return (
                            <ItemList items={items} eventId={eventid} />
                        )
                    } else {
                        return (
                            <div>
                                {error}
                            </div>
                        )
                    }
                })()
            }
        </div>
    )
}

export default Event