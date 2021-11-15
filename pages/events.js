import React, { useEffect, useState } from "react"
import Head from 'next/head'
import styles from "../styles/Events.module.css"
import NavigationBar from '../components/NavigationBar'

const Events = () => {
    return(
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Events</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="events"/>

            <main>
                <section className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <h1 className={styles.header}>Event calendar</h1>
                            <h2 className={styles.subheader}>Subtitle-a-thon Europeana XX</h2>    
                        </div>
                    </div>
                    <div className={`row mt-5 ${styles.eventrowbackground}`}>
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-4 pt-5">
                            <p className={styles.eventheader}>
                            <a name="warsaw">Subtitle-a-thon Challenge Warsaw</a>  
                            </p>
                            <p className={styles.text}>
                                Join us for the Europeana XX: Subtitle-a-thon challenge in Warsaw and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                            </p>
                            <p className={styles.text}>
                                The National Film Archive - Audiovisual Institute (FINA) and The European Union National Institutes for Culture (EUNIC) Cluster Warsaw are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.text}>
                                The kick-off of the subtitle-a-thon takes place on Saturday, June 12th at 11.00 CET with a two hour introductory session, and will run online for seven days with a closing session on Friday, June 18th at 17.00 CET.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/event/warsaw">
                                    <div className={styles.button}>
                                        Read more
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className="col-1"></div>
                        <div className="d-none d-lg-block col-lg-6"> 
                            <div className={`${styles.eventimageodd} ${styles.eventimagesoldiers}`}>
                                <div className={styles.eventimagedatewrapper}>
                                    <div className={styles.evendateblock}>
                                        <span className={styles.eventdateblockdates}>
                                            12 - 18
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

                    <div className={`row ${styles.eventrowbackground}`}>
                        <div className="d-none d-lg-block col-lg-6"> 
                            <div className={`${styles.eventimageeven} ${styles.eventimageboarding}`}>
                                <div className={`${styles.eventimagedatewrapper} justify-content-end`}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockright}`}>
                                        <span className={styles.eventdateblockdates}>
                                            6 - 11
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            July
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-4 pt-5">
                            <p className={styles.eventheader}>
                            <a name="frankfurt">Subtitle-a-thon Challenge Frankfurt</a>  
                            </p>
                            <p className={styles.text}>
                                Join us for the Europeana XX: Subtitle-a-thon challenge in Frankfurt and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                            </p>
                            <p className={styles.text}>
                                The DFF - Deutsches Filminstitut & Filmmuseum and The European Union National Institutes for Culture (EUNIC) Cluster Berlin are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.text}>
                                The kick-off of the subtitle-a-thon takes place on Tuesday, July 6th at 16.00 CET with a two hour introductory session, and will run online for six days with a closing session on Sunday, July 11th at 17.00 CET.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/event/frankfurt">
                                    <div className={styles.button}>
                                        Read more
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className={`col-1 ${styles.eventrowbackground}`}></div>
                    </div>

                    <div className={`row ${styles.eventrowbackground}`}>
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-4 pt-5">
                            <p className={styles.eventheader}>
                            <a name="rome">Subtitle-a-thon Challenge Rome</a>  
                            </p>
                            <p className={styles.text}>
                                Join us for the Europeana XX: Subtitle-a-thon Challenge Rome and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                            </p>
                            <p className={styles.text}>
                                Cinecittà and The European Union National Institutes for Culture (EUNIC) Cluster Rome are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.text}>
                                The kick-off of the subtitle-a-thon takes place on Saturday, October 23 at 11.00 CEST with a one hour and a half introductory session, and will run online for seven days with a closing session on Friday, October 29 at 17.00 CEST.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/event/rome">
                                    <div className={styles.button}>
                                        Read more
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className="col-1"></div>
                        <div className="d-none d-lg-block col-lg-6"> 
                            <div className={`${styles.eventimageodd} ${styles.eventimagemeeting}`}>
                                <div className={styles.eventimagedatewrapper}>
                                    <div className={styles.evendateblock}>
                                        <span className={styles.eventdateblockdates}>
                                            23 - 29
                                        </span>
                                        <hr className={styles.evendateblockline}/>
                                        <span className={styles.eventdateblockmonth}>
                                            October
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row ${styles.eventrowbackground}`}>
                        <div className="d-none d-lg-block col-lg-6"> 
                            <div className={`${styles.eventimageeven} ${styles.eventimagebeach}`}>
                                <div className={`${styles.eventimagedatewrapper} justify-content-end`}>
                                    <div className={`${styles.evendateblock} ${styles.evendateblockright}`}>
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
                        <div className="col-1"></div>
                        <div className="col-10 col-lg-4 pt-5">
                            <p className={styles.eventheader}>
                            <a name="amsterdam">Subtitle-a-thon Challenge Amsterdam</a>  
                            </p>
                            <p className={styles.text}>
                                Join us for the Europeana XX: Subtitle-a-thon challenge in Amsterdam and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                            </p>
                            <p className={styles.text}>
                                The Netherlands Institute for Sound and Vision, the Leiden University Centre for Linguistics and The European Union National Institutes for Culture (EUNIC) Cluster Amsterdam are pleased to invite you to a subtitle-a-thon focused on audiovisual heritage.
                            </p>
                            <p className={styles.text}>
                                The kick-off of the subtitle-a-thon takes place during the celebration of the European Day of Languages on Sunday 26th September at 15:00 CEST. The event will start with a two hour introductory session, and will run online for six days with a closing session on Saturday, October 2nd at 17.00 CEST.
                            </p>
                            <p className={styles.text}>
                                We are looking forward to seeing you! You will receive further information after registration.
                            </p>
                            <p className="d-flex justify-content-end">
                                <a href="/event/amsterdam">
                                    <div className={styles.button}>
                                        Read more
                                    </div>
                                </a>
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Events