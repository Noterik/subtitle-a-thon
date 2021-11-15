import React, { useEffect, useState } from "react"
import { useForm, useFormContext, FormProvider, Controller } from "react-hook-form" 
import Head from 'next/head'
import styles from "../styles/Profile.module.css"
import NavigationBar from '../components/NavigationBar'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Cookie from "../components/Cookie"
import { useRouter } from "next/router"
import Loader from 'react-loader-spinner';
import Select from "react-select";
const languages = require('../i18n/lang.json');
const locales = languages.locales;

const manifestPre = "https://iiif.europeana.eu/presentation/";
const manifestPost = "/manifest?format=3";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
const user = <FontAwesomeIcon icon={faUser} />;

const months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const customSelectStyle = {
    control: (provided, state) => ({
        ...provided,
        border: "1px solid #C4C4C4",
        borderRadius: "8px",
        padding: "2px",
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: "#3B236A",
        color: "#fff",
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "#fff",
      }),
}

const logOut = () => {
    fetch(apiUrl+"/user/logout",
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.success) {
            Cookie.deleteCookie("user");
            window.location.href = "/";
        }
    });
};

const EventList = ({ events }) => {
    return (
        <div className={styles.gridwrapper}>
            {events && events.map((item, key) => {
                return (
                    <a key={key} href={`/event/${item.pagename}`}>
                        <div className={styles.griditem}>
                            <div className={styles.gridcontentwrapper}>
                                <div className={styles.evendateblock}>
                                <span className={styles.eventdateblockdates}>
                                {new Date(item.start_date).getDate()}-{new Date(item.end_date).getDate()}
                                </span>
                                <hr className={styles.evendateblockline}/>
                                <span className={styles.eventdateblockmonth}>
                                    {months[new Date(item.start_date).getMonth()]}
                                    {months[new Date(item.start_date).getMonth()] != months[new Date(item.end_date).getMonth()] ? " - "+ months[new Date(item.end_date).getMonth()] : ""} 
                                </span>
                                </div>
                                <div className={styles.eventdescriptionblock}>
                                    <span className={styles.eventtitle}>{item.title}</span>
                                    <br/>
                                    <span className={styles.eventdescription}>{item.formatteddate}</span>
                                    <br/>
                                    <span className={styles.eventdescription}>{item.description}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                )
            })}
        </div>
    )
};

const RegistrationList = ({ registrations }) => {
    return (
        <div className={styles.registrationwrapper}>
            {registrations && registrations.map((item, key) => {
                return (
                    <div key={key} className={styles.registration}>
                        <div className="row">
                            <div className={`col-4 ${styles.fullname}`}>
                                Full name: {item.fullname}
                            </div>
                            <div className={`col-4 ${styles.email}`}>
                                Email: {item.email}
                            </div>
                            <div className={`col-4 ${styles.nationality}`}>
                                Nationality: {item.nationality}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-4">
                                User name: {item.username}
                            </div>
                            <div className={`col-4 ${styles.languages}`}>
                                Native languages:&nbsp;
                                {item.native_languages.split(",").map((i, k) => {
                                    return (
                                        <span key={k}>{locales.find(obj => {
                                            return obj.iso == i 
                                        }).name}</span>
                                    )
                                })}
                            </div>                        
                            <div className={`col-4 ${styles.languages}`}>
                                Foreign languages:&nbsp;
                                {item.foreign_languages.split(",").map((i, k) => {
                                    return (
                                        <span key={k}>{locales.find(obj => {
                                            return obj.iso == i 
                                        }).name}, </span>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-4">
                                Location: {item.location}
                            </div>
                            <div className="col-4">
                                Gender: {item.gender}
                            </div>
                            <div className="col-4">
                                Age: {item.age}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-4">
                                Professional Background: {item.professional_background}
                            </div>
                            <div className="col-4">
                            Europeana known: {item.europeana_known}
                            </div>
                            <div className="col-4">
                                Email updates: {item.email_updates}
                            </div>
                        </div>
                        <div className="row">
                            
                            <div className={`col-2 ${styles.approve}`}>
                                <button id={`registration_approve_${item.registrationid}`} onClick={() => ApproveRegistration(item.registrationid)}>Accept {item.accepted == 1 ? "✔️" : null}</button>
                            </div>
                            <div className={`col-2 ${styles.reject}`}>
                                <button id={`registration_reject_${item.registrationid}`} onClick={() => RejectRegistration(item.registrationid)}>Reject {item.rejected == 1 ? "✔️" : null}</button>
                            </div>
                        </div>
                        <div className="row">
                            
                            <div className={`col-2 ${styles.approve}`}>
                                <button id={`registration_opening__session_email_${item.registrationid}`} onClick={() => OpeningSessionEmail(item.registrationid)}>Opening session</button>
                            </div>
                            <div className={`col-2 ${styles.approve}`}>
                                <button id={`confirmation_link_email_${item.registrationid}`} onClick={() => ConfirmationLinkEmail(item.registrationid)}>Confirmation + link</button>
                            </div>
                        </div>
                        <hr/>
                    </div>
                    
                )   
            })}
        </div>
    )
};

const SubmittedList = ({ submittedvideos }) => {
    const [waitingForEventCollection, setWaitingForEventCollection] = useState(true);
    const [eventCollection, setEventCollection] = useState([]);
    const [waitingForReviewers, setWaitingForReviewers] = useState(true);
    const [reviewers, setReviewers] = useState([]);

    if (submittedvideos.length > 0) {
        const eventid = submittedvideos[0].eventid;

        useEffect(() => {
            async function fetchData() {
                fetch(apiUrl+"/user/list/"+eventid,
                {
                    method: "GET",
                    credentials: "include",
                }).then(response => response.json())
                .then(response => {
                    if (response.error) {                  
                        setWaitingForEventCollection(false);
                    } else {
                        setEventCollection(response);
                        setWaitingForEventCollection(false);
                    } 
                });
            }
            fetchData();
        }, []);
        useEffect(() => {
            async function fetchData() {
                fetch(apiUrl+"/admin/getreviewers",
                {
                    method: "GET",
                    credentials: "include",
                }).then(response => response.json())
                .then(response => {
                    if (response.error) {                  
                        setWaitingForReviewers(false);
                    } else {
                        setReviewers(response.results);
                        setWaitingForReviewers(false);
                    } 
                });
            }
            fetchData();
        }, []);
    } 

    const onClick = (embedid) => {       
        window.open("https://embd.eu/"+embedid, "_blank");
    }

    const downloadSubtitles = (manifest, itemid, language, eupsid) => {
        const data = {"manifest": manifest, "id": itemid, "language": language, "eupsid": eupsid};
        let filename = "subtitle.vtt";

        fetch(apiUrl+"/admin/downloadsubtitles", 
        {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                body: JSON.stringify(data)
        }).then((response) => {
            const header = response.headers.get('Content-Disposition');
            const parts = header.split(';');
            filename = parts[1].split('=')[1];
            return response.text();
        }).then((text) => {
            let data = new Blob([text], {type: 'text/plain', endings:'native'});
            let url = URL.createObjectURL(data);
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        });
    }

    return (
        <>
        {(waitingForEventCollection || waitingForReviewers) ? (
            <>
            {submittedvideos.length > 0 ? (
                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />  
            ) : (
                null
            )}
            </>
        ) : (
            <div className="row w-100 d-flex">
                {submittedvideos && submittedvideos.map((i, key) => { 
                return (
                <div className={`col-4 ${styles.videocard}`} key={key}>
                    <div className={styles.videocardinner}>
                    <div className={`pt-4 pb-4 ${styles.videoinner}`}>
                        <img src={
                                eventCollection.items.find((item) => {
                                    return item.id.replace(/\//g, "-") === i.itemid;
                                }).edmPreview
                            } 
                            className={`${styles.videoimage}`}
                            style={{cursor: "pointer"}} 
                            onClick={() => {
                                onClick(i.embed)}
                            }
                        />
                        <span className={styles.characterslabel}>
                            { languages.locales && languages.locales.map((it, index) => {
                                if (it.iso === i.language) {
                                    return (
                                        it.name       
                                    );
                                }
                            })}
                        </span>
                        {i.review_done == "1" ? (
                            <span className={styles.reviewedlabel}>
                                Reviewed
                            </span>
                        ) : ( 
                            null
                        )}
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {eventCollection.items.find((item) => {
                                return item.id.replace(/\//g, "-") === i.itemid;
                            }).title[0]}
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            User: {i.username}
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {i.characters} characters
                        </div>
                        <div>
                            <AssignReviewerForm itemId={i.id} item={i} reviewers={reviewers} />
                        </div>
                        {i.review_done == "1" ? (
                            <>
                            <div className="row">
                                <div className="col-6">
                                    <span className="font-italic">Quality:</span> {i.review_quality}
                                </div>
                                <div className="col-6">
                                    <span className="font-italic">Approp.:</span> {i.review_appropriate}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <span className="font-italic">Flow:</span> {i.review_flow}
                                </div>
                                <div className="col-6">
                                    <span className="font-italic">Grammar:</span> {i.review_grammatical}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <span className="font-italic">Comments:</span> {i.review_comments}
                                </div>
                            </div>
                            </>
                        ) : (
                            null
                        )}
                        <div>
                            <br/>
                            <span
                                className={styles.downloadsubtitles}
                                onClick={() => {
                                    downloadSubtitles(i.manifest, i.itemid, i.language ,i.eupsid)
                                }}
                            >
                                Download subtitles      
                            </span>
                               
                        </div>
                    </div>
                    </div>
                </div>
                )}
                )}
            </div>
        )}
        </>
    )
};

const AssignReviewerForm = ({itemId, item, reviewers}) => {
    const methods = useForm({
        mode: "onChange",
    })
    const {
        handleSubmit,
        register,
        formState,
    } = methods

    const onSubmit = data => {
        data.itemid = itemId;
        fetch(apiUrl+"/admin/setreviewer",
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
                alert(response.error);
            }
        });
    };

    return (
        <>
        {item.review_done == "0" ? (
        <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <select 
                    id="reviewer"
                    name="reviewer"
                    ref={register({
                        required: true,
                        validate: (value) => {
                            return value !== "-1";
                        } 
                    })}
                    defaultValue={item.reviewerid === null ? "-1" : item.reviewerid}
                >
                    <option 
                        value="-1"
                        disabled
                    >
                        Reviewers
                    </option>
                    {reviewers && reviewers.map((j, key) => { 
                        return (<option     
                            value={j.userid} 
                            name="reviewer"
                            key={key} 
                        >
                            {j.username}
                        </option>)
                    })}
                </select>
                &nbsp; &nbsp;
                <button
                    type="submit"
                    className={styles.submitbutton}
                    disabled={!formState.isValid}
                >
                    Assign        
                </button>
            </form>
        </FormProvider>
        ) : (
            <p>
            <span className="font-italic">Reviewer:</span>&nbsp;
            {reviewers && reviewers.map((j, key) => { 
                if (j.userid == item.reviewerid) {
                    return j.username
                }
            })}
            </p>
        )
        }
        </>        
    )
}

const AssignedList = ({ assignedvideos }) => {
    const [waitingForAssignedCollection, setWaitingForAssignedCollection] = useState(true);
    const [assignedCollection, setAssignedCollection] = useState([]);

    if (assignedvideos.length > 0) {
        const eventid = assignedvideos[0].eventid;

        useEffect(() => {
            async function fetchData() {
                fetch(apiUrl+"/user/list/"+eventid,
                {
                    method: "GET",
                    credentials: "include",
                }).then(response => response.json())
                .then(response => {
                    if (response.error) {                  
                        setWaitingForAssignedCollection(false);
                    } else {
                        setAssignedCollection(response);
                        setWaitingForAssignedCollection(false);
                    } 
                });
            }
            fetchData();
        }, []);
    } 

    const onClick = (embedid) => {       
        window.open("https://embd.eu/"+embedid, "_blank");
    }

    return (
        <>
        {waitingForAssignedCollection ? (
            <>
            {assignedvideos.length > 0 ? (
                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />  
            ) : (
                null
            )}
            </>
        ) : (
            <div className="row w-100 d-flex">
                {assignedvideos && assignedvideos.map((i, key) => { 
                return (
                <div className={`col-4 ${styles.videocard}`} key={key}>
                    <div className={styles.videocardinner}>
                    <div className={`pt-4 pb-4 ${styles.videoinner}`}>
                        <img src={
                                assignedCollection.items.find((item) => {
                                    return item.id.replace(/\//g, "-") === i.itemid;
                                }).edmPreview
                            } 
                            className={`${styles.videoimage}`}
                            style={{cursor: "pointer"}} 
                            onClick={() => {
                                onClick( i.embed)}
                            }
                        />
                        <span className={styles.characterslabel}>
                            { languages.locales && languages.locales.map((it, index) => {
                                if (it.iso === i.language) {
                                    return (
                                        it.name       
                                    );
                                }
                            })}
                        </span>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {assignedCollection.items.find((item) => {
                                return item.id.replace(/\//g, "-") === i.itemid;
                            }).title[0]}
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            User: {i.username}
                        </div>
                        <div className={`pt-2 ${styles.videotitle}`}>
                            {i.characters} characters
                        </div>
                        <div>
                        {i.review_done == 1 ? (
                            "Reviewed"
                        ) : (
                            <ReviewForm itemId={assignedCollection.items.find((item) => {
                                return item.id.replace(/\//g, "-") === i.itemid;
                            }).id} item={i} />
                            
                        )}
                        {i.review_done == "1" ? (
                            <>
                            <div className="row">
                                <div className="col-6">
                                    <span className="font-italic">Quality:</span> {i.review_quality}
                                </div>
                                <div className="col-6">
                                    <span className="font-italic">Approp.:</span> {i.review_appropriate}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <span className="font-italic">Flow:</span> {i.review_flow}
                                </div>
                                <div className="col-6">
                                    <span className="font-italic">Grammar:</span> {i.review_grammatical}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <span className="font-italic">Comments:</span> {i.review_comments}
                                </div>
                            </div>
                            </>
                        ) : (
                            null
                        )}
                        </div>
                    </div>
                    </div>
                </div>
                )}
                )}
            </div>
        )}
        </>
    )
};

const ReviewForm = ({itemId, item}) => {
    const methods = useForm({
        mode: "onChange",
    })
    const {
        handleSubmit,
        register,
        formState,
    } = methods

    const onSubmit = data => {
        fetch(apiUrl+"/review/review/"+item.id,
        {
            method: "GET",
            credentials: "include"
        }).then(response => response.json())
        .then(response => {
            if (response.error) {
                alert(response.error);
            } else if (response.success) {
                let manifestUrl = encodeURIComponent("https://api.subtitleathon.eu/manifest.php?manifest="+encodeURIComponent(manifestPre + itemId + manifestPost));
                window.open("https://editor.euscreen.eu?manifest="+manifestUrl+"&reviewkey="+response.success.key+"&id="+item.eupsid, "_self");
                //window.open("https://preview2.video-editor.eu?manifest="+manifestUrl+"&reviewkey="+response.success.key+"&id="+item.eupsid, "_self");
            } else {

            }
        });
    };
    
    return (
        <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <button
                    type="submit"
                    className={styles.submitbutton}
                    disabled={!formState.isValid}
                >
                    Review        
                </button>
            </form>
        </FormProvider>
    )
};

const getJoinedEvents = (setEvents, setWaitingForContent) => {
    fetch(apiUrl+"/event/joinedevents",
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.results) {
            setEvents(response.results);
            setWaitingForContent(false);
        }
    });
}

const getMyVideos = (setMyVideos, setWaitingForVideos) => {
    fetch(apiUrl+"/user/myvideos",
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.results) {
            setMyVideos(response.results);
            setWaitingForVideos(false);
        }
    });
}

const getRegistrations = (setRegistrations, setWaitingForRegistrations, adminEvent) => {
    fetch(apiUrl+"/admin/registrations/"+adminEvent,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.results) {
            setRegistrations(response.results);
            setWaitingForRegistrations(false);
        }
    });
}

const getEventDetails = (setEuropeanaSetId, setEventId, setEventLanguages, setWaitingForEventData, adminEvent) => {
    fetch(apiUrl+"/admin/eventdetails/"+adminEvent,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.success) {
            setEuropeanaSetId(response.success.europeana_collection);
            setEventId(response.success.eventid);
            setEventLanguages(response.success.allowed_languages);
            setWaitingForEventData(false);
        }
    });
}

const getSubmittedVideos = (setSubmittedVideos, setWaitingForSubmittedVideos, adminEvent) => {
    fetch(apiUrl+"/admin/getsubmittedvideos/"+adminEvent,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.results) {
            setSubmittedVideos(response.results);
            setWaitingForSubmittedVideos(false);
        }
    });
}

const getAssignedVideos = (setAssignedVideos, setWaitingForAssignedVideos) => {
    fetch(apiUrl+"/review/getassignedvideos",
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.results) {
            setAssignedVideos(response.results);
            setWaitingForAssignedVideos(false);
        }
    });
}


const ApproveRegistration = (registrationid) => {
    fetch(apiUrl+"/admin/approve/"+registrationid,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.success) {
            document.getElementById("registration_approve_"+registrationid).innerHTML = "Accept ✔️";
        }
    });
}

const RejectRegistration = (registrationid) => {
    fetch(apiUrl+"/admin/reject/"+registrationid,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        if (!response.error && response.success) {
            document.getElementById("registration_reject_"+registrationid).innerHTML = "Reject ✔️";
        }
    });
}

const OpeningSessionEmail = (registrationid) => {
    fetch(apiUrl+"/admin/sendopeningsessiondetails/"+registrationid,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        alert("Opening session email send to "+response.success.message);
    });
}

const ConfirmationLinkEmail = (registrationid) => {
    fetch(apiUrl+"/admin/sendconfirmationlink/"+registrationid,
    {
        method: "GET",
        credentials: "include",
    }).then(response => response.json())
    .then(response => {
        alert("Confirmation + link email send to "+response.success.message);
    });
}

const getItems = ( events, setCollection, setWaitingForCollection ) => {
    const [tmpCollection, setTempCollection] = useState("");
    const [eventsDone, setEventsDone] = useState(0);

    useEffect(() => {
        async function fetchEventsData() {
            fetch(apiUrl+"/user/list/"+events[eventsDone],
            {
                method: "GET",
                credentials: "include",
            }).then(response => response.json())
            .then(response => {
                if (response.error) {                  

                } else {
                    //check if we need to merge the items
                    if (tmpCollection === "") {
                        setTempCollection(response);
                    } else {
                        const oldCollection = tmpCollection;
                        //merge items
                        const merged = oldCollection["items"].concat(response["items"]);    
              
                        oldCollection["items"] = merged;
                        //update entire collection
                        setTempCollection(oldCollection);
                    } 

                    setEventsDone(eventsDone+1);

                    //the last request should signal this is done
                    if (eventsDone == events.length -1) {
                        if (events.length == 1) {
                               setCollection(response);
                        } else {
                            setCollection(tmpCollection);
                        }
                        setWaitingForCollection(false);
                    } 
                } 
            });
        }
        fetchEventsData();
    }, [eventsDone]);
}


 
const ItemList = ({ myVideos }) => {
    const [waitingForCollection, setWaitingForCollection] = useState(true);
    const [collection, setCollection] = useState("");

    if (myVideos.length > 0) {
        //get the unique event ids for this users videos
        const uniqueEventIdsSet = [...new Set(myVideos.map(item => item.eventid))]; 
        const events = [...uniqueEventIdsSet];

        //get the combined collections for the list of events
        getItems(events, setCollection, setWaitingForCollection);
    }

    const onClick = (itemid, itemkey, eupsid) => {       
        let manifestUrl = encodeURIComponent("https://api.subtitleathon.eu/manifest.php?manifest="+encodeURIComponent(manifestPre + itemid + manifestPost));
        if (eupsid != null) {
            window.open("https://editor.euscreen.eu?manifest="+manifestUrl+"&key="+itemkey+"&id="+eupsid, "_self");
            //window.open("https://preview2.video-editor.eu?manifest="+manifestUrl+"&key="+itemkey+"&id="+eupsid, "_self");
        } else {
            window.open("https://editor.euscreen.eu?manifest="+manifestUrl+"&key="+itemkey, "_self");
            //window.open("https://preview2.video-editor.eu?manifest="+manifestUrl+"&key="+itemkey, "_self");
        }
    }

    return (
        <>
        {waitingForCollection ? (
            <>
            {myVideos.length > 0 ? (
                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />  
            ) : (
                null
            )}
            </>
        ) : (
            <div className="row w-100 d-flex">
            {myVideos && myVideos.map((i, key) => { 
                return (
                    <div className={`col-4 ${styles.videocard}`} key={key}>
                        <div className={styles.videocardinner}>
                        <div className={`pt-4 pb-4 ${styles.videoinner}`}>
                            <img src={
                                collection.items.find((item) => {
                                    return item.id.replace(/\//g, "-") === i.itemid;
                                }).edmPreview
                            } className={styles.videoimage} />
                            {i.finalized === "1"  ? (
                                <span className={styles.characterslabel}>
                                    Submitted
                                </span>
                            ) : null }
                            <div className={`pt-2 ${styles.videotitle}`}>
                                {collection.items.find((item) => {
                                    return item.id.replace(/\//g, "-") === i.itemid;
                                }).title[0]}
                            </div>
                            <div className={styles.videodescription}>
                            {collection.items.find((item) => {
                                    return item.id.replace(/\//g, "-") === i.itemid;
                            }).dcDescription === undefined ? null : collection.items.find((item) => {
                                return item.id.replace(/\//g, "-") === i.itemid;
                            }).dcDescription[1]}                          
                            </div>
                            { i.finalized === "1" ? (
                                <div className={`pt-2 ${styles.videotitle}`}>
                                    {i.characters} characters
                                </div>
                            ) : (
                                <>
                                    <div className={`pt-2 ${styles.videotitle}`}>
                                        Subtitle in:
                                    </div>
                                    <div>
                                    { languages.locales && languages.locales.map((it, index) => {
                                    if (it.iso === i.language) {
                                        return (
                                            it.name       
                                        );
                                    }
                                    })}
                                    &nbsp;&nbsp;
                                    <button
                                        type="submit"
                                        className={styles.submitbutton}
                                        onClick={() => {
                                            onClick(collection.items.find((item) => {
                                                return item.id.replace(/\//g, "-") === i.itemid;
                                            }).id, i.item_key, i.eupsid)}
                                        }
                                    >
                                        Continue        
                                    </button>
                                    </div>
                                </>
                            )}
                        </div>
                        </div>
                </div>
                )
            })}
            </div>
        )}
        </>
    )
}

const Profile = () => {
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ waitingForRegistrations, setWaitingForRegistrations] = useState(true);
    const [ username, setUsername] = useState("");
    const [ email, setEmail ] = useState("");
    const [ events, setEvents ] = useState([]);
    const [ registrations, setRegistrations ] = useState([]);
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminEvent, setAdminEvent] = useState("");
    const [isReviewer, setIsReviewer] = useState(false);
    const [tabKey, setTabKey] = useState('events');
    const [waitingForEventData, setWaitingForEventData] = useState(true);
    const [europeanaSetId, setEuropeanaSetId] = useState("");
    const [eventid, setEventId] = useState("");
    const [eventLanguages, setEventLanguages] = useState("");
    const [myVideos, setMyVideos] = useState([]);
    const [waitingForVideos, setWaitingForVideos] = useState(true);
    const [submittedVideos, setSubmittedVideos] = useState([]);
    const[ waitingForSubmittedVideos, setWaitingForSubmittedVideos] = useState(true);
    const [assignedVideos, setAssignedVideos] = useState([]);
    const[ waitingForAssignedVideos, setWaitingForAssignedVideos] = useState(true);

    const methods = useForm({
        mode: "onChange",
    })

    const {
        register,
        handleSubmit,
        setError,
        formState,
        errors
    } = methods;

    const onSubmit = data => {
        fetch(apiUrl+"/admin/seteventdetails/"+eventid,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(response => {
            if (response.error) {
                Object.keys(response.error).map((key) => {
                    setError(key, {
                        type: "server" 
                    });
                });
            } else if (response.success) {
                
            } 
        });
    }

    useEffect(() => {      
        async function fetchData() {
            //check if user is logged in
            setTimeout(function (){
                const user = Cookie.getCookie("user");
                //no valid user
                if (user === null) {
                    router.push("/login");
                } else {
                    setUsername(user.username);
                    setEmail(user.email);
                    if (user.admin && user.admin === true) {
                        setIsAdmin(true);
                        if (user.admin_event) {
                            setAdminEvent(user.admin_event);
                        }
                        getRegistrations(setRegistrations, setWaitingForRegistrations, user.admin_event);
                        getEventDetails(setEuropeanaSetId, setEventId, setEventLanguages, setWaitingForEventData, user.admin_event);
                        getSubmittedVideos(setSubmittedVideos, setWaitingForSubmittedVideos,user.admin_event);
                    }
                    if (user.reviewer && user.reviewer === true) {
                        setIsReviewer(true);
                        getAssignedVideos(setAssignedVideos, setWaitingForAssignedVideos);
                    }
                    getJoinedEvents(setEvents, setWaitingForContent);
                    getMyVideos(setMyVideos, setWaitingForVideos);
                }
              }, 200);
            
        }
        fetchData();
    }, []);

    const sendSignUpMail = (eventid) => {
        fetch(apiUrl+"/admin/allowaccounts/"+eventid,
        {
            method: "GET",
            credentials: "include",
        }).then(response => response.json())
        .then(response => {
            if (!response.error && response.success) {
                alert(response.success.message);
            }
        });
    }

    return(
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Profile</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="profile"/>

            <div className="row w-100 h-100 pt-4">
                <div className="col-4 d-flex flex-wrap justify-content-center">
                    <div className={styles.profileimage}>
                        <i className={styles.user}>{user}</i>
                    </div>
                    <div className={styles.usernameblock}>
                        <h3 className={styles.username}>{username}</h3>
                    </div>
                    <div className="pt-4 w-100">
                        <p className={styles.text}>Email</p>
                        <p className={styles.uservalue}>{email}</p>
                    </div>
                    <div
                        className={`mt-4 ${styles.button}`}
                        onClick={logOut}>
                            Log out
                    </div>
                </div>
                <div className="col-8">
                    <Tabs defaultActiveKey="events" activeKey={tabKey} onSelect={(k) => setTabKey(k)}className={styles.navtabs}>
                        <Tab eventKey="events" title="My joined events" className={tabKey === "events" ? styles.activeTab : null }>
                            {waitingForContent ? (
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                            ) : (
                                <EventList events={events} />
                            )}
                        </Tab>
                        <Tab eventKey="videos" title="My videos" className={tabKey === "videos" ? styles.activeTab : null }>
                            {waitingForVideos ? (
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                            ) : (
                                <ItemList myVideos={myVideos} />
                            )}
                        </Tab>
                        { isAdmin ? (
                            <Tab eventKey="admin" title="Admin" className={tabKey === "admin" ? styles.activeTab : null }>
                            <h2>General</h2>
                                { waitingForEventData ? 
                                    null
                                :
                                    <FormProvider {...methods}>
                                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                            <div>
                                                Europeana set id:
                                                <input 
                                                    type="number"
                                                    name="europeanasetid"
                                                    defaultValue={europeanaSetId}
                                                    className={styles.formInput}
                                                    ref={register({ })}
                                                />
                                            </div>
                                            <div>
                                                Eventid:
                                                <input 
                                                    type="number"
                                                    name="eventid"
                                                    disabled
                                                    value={eventid}
                                                    className={styles.formInput}
                                                />
                                            </div>
                                            <div>
                                                Allowed languages:
                                                <Controller
                                                    control={methods.control}
                                                    id="allowedlanguages"
                                                    name="allowedlanguages"
                                                    defaultValue={locales.filter(item => {
                                                        if (eventLanguages.includes(item.iso)) {
                                                            return item;
                                                        }
                                                    })}
                                                    as={
                                                        <Select
                                                            name="nativelanguagesselect"  
                                                            className={styles.select}
                                                            classNamePrefix={styles.select} 
                                                            options={locales}
                                                            getOptionLabel={(option) => option.name}
                                                            getOptionValue ={(option) => option.iso}
                                                            placeholder="Pick one or more languages"
                                                            isMulti="true"
                                                            styles={customSelectStyle}
                                                            onChange={val => onChange(val.value)}
                                                        />
                                                    }
                                                />
                                            </div>
                                            <div>
                                            <button
                                                type="submit"
                                                className={styles.submitbutton}
                                            >
                                                Update general information       
                                            </button>
                                            </div>
                                        </form>
                                    </FormProvider>
                                }
                            <hr/>
                            <h2>Registrations</h2>
                            <button 
                                onClick={() => sendSignUpMail(eventid)}
                            >
                                Send sign up mails to accepted accounts
                            </button>
                            <br/>
                            (Applies only to approved accounts that not earlier received their sign up mail)
                            <hr/>
                            {waitingForRegistrations ? (
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                            ) : (
                                <RegistrationList registrations={registrations} />
                            )}
                        </Tab>
                        ) : (
                            null
                        )}
                        {isAdmin ? (
                            <Tab eventKey="submittedvideos" title="Submitted Videos" className={tabKey === "submittedvideos" ? styles.activeTab : null }>
                            {waitingForSubmittedVideos ? (
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                            ) : (
                                <SubmittedList submittedvideos={submittedVideos} />
                            )}
                            </Tab>
                        ) : (
                            null
                        )}
                        {isReviewer ? (
                            <Tab eventKey="assignedvideos" title="Videos for review" className={tabKey === "assignedvideos" ? styles.activeTab : null }>
                            {waitingForAssignedVideos ? (
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} />
                            ) : (
                                <AssignedList assignedvideos={assignedVideos} />
                            )}
                            </Tab>
                        ) : (
                            null
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

export default Profile