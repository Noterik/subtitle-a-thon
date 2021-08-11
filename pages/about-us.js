import Head from 'next/head'
import styles from "../styles/AboutUs.module.css"
import NavigationBar from '../components/NavigationBar'

const AboutUs = () => {

    return(
        <div className='main-container'>
            <style jsx global>{`
            body {
                background: url('/background/about.png') repeat-y;
                background-size: cover;
            }
            `}</style>
            <Head>
                <title>Subtitle-a-thon | About Us</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="about us"/>

            <main>
                <section className="container-fluid">

                    <h1 className={styles.header}>About Us</h1>
                    <h2 className={styles.subheader}>Europeana XX</h2>   

                    <div className="row pt-5">
                        <div className="col-1"></div>
                        <div className={`col-10 col-lg-5 ${styles.text}`}> 
                            <p>
                                Europeana XX: Century of Change is a thematic project co-funded by the European Union in the scope of the ‘Connecting Europe Facility’ program: an initiative to promote growth, jobs and competitiveness through infrastructure investment at a European level.
                            </p>
                            <p>
                                Europeana XX: Century of Change aims to highlight in Europeana a curated set of digitized cultural heritage collections dedicated to the 20 th century, witnessing those game-changers events and advancements in politics, technology and ways of living that had a striking impact on culture and European identity. As an international collaboration of 17 partners from all over Europe, Europeana XX: Century of Change brings together digital collections and inspiring stories about people, events, inventions, and societal phenomena that changed our world and cast their shadows well into the present. 
                            </p>
                            <p>
                                The project’s mission is to inspire European citizens, students, researchers and culture lovers to engage with their recent heritage and history, by discovering beautiful artefacts, photographs and compelling audiovisual records, to share their own stories and get creative with reusable content.
                            </p>
                            <p>
                                Discover the editorials pieces of the project at <a href="https://www.europeana.eu/en/highlights-from-the-20th-century" className={styles.link}>Europeana.eu</a>
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5"> 
                            <img src="/about-subtitleathon.jpeg" alt="about Subtitle-a-thon" className="mw-100" style={{objectFit: 'cover'}} width="100%" height="100%" />
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row pt-5"></div>
                    <div className="row pt-5"></div>
                    <div className="row pt-5">
                        <div className="col-1"></div>
                        <div className={`col-10 col-lg-5 ${styles.text}`}> 
                            <p>
                            The Europeana XX: subtitle-a-thon has been co-created together with an international and multilingual group of master students from the Katholieke Universiteit Leuven, in Belgium. Yang, from China, Dieter and Marie, from Belgium, and Felipe, from Spain, have contributed to the initiative as part of their Cultural Policy course.
                            </p>
                        </div>
                        <div className='col-1 d-lg-none'></div>
                        <div className='col-1 d-lg-none'></div>
                        <div className="col-10 col-lg-5"> 
                        <img src="/europeana-xx-group.jpg" alt="Europeana XX group" className="mw-100" style={{objectFit: 'cover'}} width="100%" height="100%" />
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
                <section className="container-fluid">
                    <div className="row pt-5">
                        <div className="col-1"></div>
                        <div className="col-10 d-flex justify-content-center">
                        <h1 className={styles.partnersheader}>Project Partners</h1>
                        </div>
                        <div className="col-1"></div>
                    </div>
                    <div className="row pt-5">
                        <div className="col-1"></div>
                        <div className="col-10 d-flex flex-wrap justify-content-center">
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.beeldengeluid.nl/en" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/nisv.png" alt="Netherlands Institute for Sound and Vision" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Netherlands Institute for Sound and Vision</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://pro.europeana.eu/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/europeana.jpg" alt="Europeana Foundation" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Europeana Foundation</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://cinecitta.com/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/luce.png" alt="Istituto Luce-Cinecittà" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Istituto Luce-Cinecittà</p>
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
                                <a href="https://www.dff.film/en/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/dff.png" alt="Deutsches Filminstitut & Filmmuseum e.V." className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Deutsches Filminstitut & Filmmuseum e.V.</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.catwalkpictures.com/index,en.html" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/catwalk.png" alt="Catwalk Pictures" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Catwalk Pictures</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://fashionheritage.eu/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/efha.png" alt="European Fashion Heritage Association" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">European Fashion Heritage Association</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.kuleuven.be/english/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/kuleuven.png" alt="Katholieke Universiteit Leuven" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Katholieke Universiteit Leuven</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.photoconsortium.net/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/photoconsortium.png" alt="Photoconsortium - International Consortium for Photographic Heritage" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Photoconsortium - International Consortium for Photographic Heritage</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://jck.nl/en/location/jewish-historical-museum" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/jck.png" alt="Jewish Historical Museum" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Jewish Historical Museum</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://jhn.ngo/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/jhn.png" alt="Jewish Heritage Network" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Jewish Heritage Network</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.ntua.gr/en/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/ntua.jpg" alt="National Technical University of Athens" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">National Technical University of Athens</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://pangeanic.com/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/pangeanic.png" alt="Pangeanic" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Pangeanic</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://www.tib.eu/en/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/tib.png" alt="Technische Informationsbibliothek" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Technische Informationsbibliothek</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="http://anacode.de/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/anacode.png" alt="Anacode" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Anacode</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="http://think-code.io/" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/thinkcode.png" alt="Thinkcode" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Thinkcode</p>
                                </a>
                            </div>
                            <div className={styles.partnerwrapper}>
                                <a href="https://noterik.nl" target="_blank" className={styles.link}>
                                    <div className={styles.partner}>
                                        <img src="/partner/noterik.png" alt="Noterik B.V" className="mw-100" style={{objectFit: 'contain'}} width="100%" height="100%" /> 
                                    </div>
                                    <p className="font-weight-bold text-break pt-2">Noterik B.V</p>
                                </a>
                            </div>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default AboutUs