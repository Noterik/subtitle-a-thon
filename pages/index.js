import Head from 'next/head'
import styles from '../styles/Home.module.css'
import NavigationBar from '../components/NavigationBar'


/* stats block
<div className="row">
                  <div className={`col-4 ${styles.statisticsnumber}`}>2 000</div>
                  <div className={`col-4 ${styles.statisticsnumber}`}>10 340</div>
                  <div className={`col-4 ${styles.statisticsnumber}`}>10</div>
                </div>
                <div className="row">
                  <div className={`col-4 ${styles.statisticsdesc}`}>minutes</div>
                  <div className={`col-4 ${styles.statisticsdesc}`}>characters</div>
                  <div className={`col-4 ${styles.statisticsdesc}`}>languages</div>
                </div>
*/

export default function Home() {
  return (
    <div className="main-container">
      <Head>
        <title>Subtitle-a-thon | Home</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
      </Head>

      <NavigationBar page="home"/>

      <main>
        <section className="container-fluid">
          <div className="row">
            <div className={`col-12 ${styles.header}`}>
              <img src="/subtitleathon-logo-large.png" alt="subtitle-a-thon logo" className={styles.headerlogo} />
            </div>
          </div>

          <div className="row pt-lg-4">
            <div className="col-1"></div>
            <div className="col-10">
              <h2 className={styles.welcomeheader}>Welcome to the Subtitle-a-thon challenge!</h2>
            </div>
            <div className="col-1"></div>
          </div>
          <div className="row pt-2">
            <div className="col-1"></div>
            <div className="col-10 col-lg-5">
              <p className={styles.welcometext}>
                The Europeana XX: subtitle-a-thon is a crowdsourcing initiative that allows you to create and add subtitles to archival audiovisual content. 
                By sharing your language and subtitling skills, you will contribute to making audiovisual content more accessible to multilingual audiences and widely available.
                The subtitle-a-thon challenges are part of a raising awareness campaign about the value of multilingual access to AV archival footage and are not intended to compete with or replace professional level translation.
                Sign up to our events and join the challenge to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
              </p>
              <p className={styles.welcometext}>
                Joining is free and open to everyone.
              </p>
              <p className="d-flex justify-content-center">
                <a href="/registration">
                  <div className={styles.button}>
                  Register
                  </div>
                </a>
              </p>
            </div>
            <div className="col-1"></div>
            <div className='col-1 d-lg-none'></div>
            <div className="col-10 col-lg-4">
              <div className={styles.statisticsblock}>
                <p className={styles.statisticsnumber}>
                  Subtitle the Past, Translate for the Future.
                </p>
              </div>
            </div>
            <div className="col-1"></div>
          </div>
        </section>

        <section className="container-fluid">
          <div className="row pt-3 pt-lg-5">
            <div className="col-1"></div>
            <div className="col-10">
              <h2 className={styles.aboutheader}>About Subtitle-a-thon</h2>
            </div>
            <div className="col-1"></div>
          </div>
          <div className="row pt-2">
            <div className="col-1"></div>
            <div className="col-10 col-lg-5">
              <p className={styles.welcometext}>
                Subtitle-a-thon is an initiative that invites the public to create and add subtitles to archival audiovisual clips coming from various European heritage collections available on <a href="https://europeana.eu" className={styles.link}>Europeana.eu</a>.
                The aim of the experience organised as part of the Europeana XX: Century of Change project is to make audiovisual material accessible to multilingual audiences and, 
                for the currently underrepresented AV-heritage, to become more widely available.
              </p>
              <p className={styles.welcometext}>
                The four online events are coordinated by four members of the project: the Deutsches Filminstitut & Filmmuseum - DFF (Germany),
                The Istituto Luce Cinecittà (Italy), the National Film Archive - Audiovisual Institute - FINA (Poland) and, the Netherlands Institute for Sound and Vision - NISV (The Netherlands). 
                During the events, people with different language skills work together toward a common goal: to create and add different subtitles to archival media fragments coming from various European collections that may be further shown in the Europeana XX editorials. 
                During the events, participants will have the opportunity to use specialized technology to subtitle the content.
              </p>
              <p className={styles.welcometext}>
              <h2 className={styles.aboutheader}>Who can participate?</h2>
                The subtitle-a-thons are open for a diversified audience of cultural heritage institutions, educators and researchers in the creative industries, 
                as well as every European citizen with an interest in history and culture.
              </p>
              <p className={styles.welcometext}>
              <span className="font-weight-bold">Get involved!</span> Discover more about each of the four events <a href="/events" className={styles.link}>here</a>
              </p>
            
            </div>
            <div className='col-1 d-lg-none'></div>
            <div className='col-1 d-lg-none'></div>
            <div className="col-10 col-lg-5">
              <p className="d-flex justify-content-center" style={{maxHeight: '300px'}}>
                <img src="/about-subtitleathon.jpeg" alt="video player example" className="mw-100" style={{objectFit: 'contain'}}/>
              </p>
              <aside className={`${styles.aboutparticipate} mt-5 mx-lg-5`}>
                <p className={`${styles.welcometext} pt-5`}>
                  Are you a history buff or amateur translator? 
                  Do you want to actively participate in making European cultural heritage available to everyone? 
                  Then the Europeana XX: Subtitle-a-thon is the right thing for YOU.
                </p>
                <p className={styles.welcometext}>
                  Register here and join the challenge to <span className="font-italic">Subtitle the Past, Translate for the Future.</span>
                </p>
                <p className="d-flex justify-content-center pt-1">
                  <a href="/registration">
                    <div className={styles.button}>
                      Join us
                    </div>
                  </a>
                </p>
              </aside>
              <img className={styles.personspeaking} src="/person-speaking.png" alt="person speaking illustration" />
            </div>
            <div className="col-1"></div>
          </div>
        </section>

        <section className="container-fluid">
          <div className="row pt-5">
            <div className="col-12 d-flex justify-content-center">
              <h1 className={styles.eventheader}>Events</h1>
            </div>
          </div>
          <div className="row pt-2 pt-lg-5 mb-3 mb-lg-4">
            <div className="col-1"></div>
            <div className="col-10 d-flex flex-wrap justify-content-start">
                <div className={`${styles.griditem} ${styles.eventimagesoldiers}`}>
                  <div className={styles.gridcontentwrapper}>
                    <div className={styles.evendateblock}>
                      <span className={styles.eventdateblockdates}>
                        12-18
                      </span>
                      <hr className={styles.evendateblockline}/>
                      <span className={styles.eventdateblockmonth}>
                        June
                      </span>
                    </div>
                    <div className={styles.eventdescriptionblock}>
                      <span className={styles.eventtitle}>Subtitle-a-thon Challenge Warsaw</span>
                      <br/>
                      <span className={styles.eventdescription}>12 - 18 June 2021</span>
                      <br/>
                      <span className={styles.eventdescription}>Europeana XX: Subtitle-a-thon Challenge Warsaw</span>
                      <a href="/events#warsaw">
                        <div className={styles.eventreadmore}>
                          Read more
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              
                <div className={`${styles.griditem} ${styles.eventimageboarding}`}>
                  <div className={styles.gridcontentwrapper}>
                    <div className={styles.evendateblock}>
                      <span className={styles.eventdateblockdates}>
                        6-11
                      </span>
                      <hr className={styles.evendateblockline}/>
                      <span className={styles.eventdateblockmonth}>
                        July
                      </span>
                    </div>
                    <div className={styles.eventdescriptionblock}>
                      <span className={styles.eventtitle}>Subtitle-a-thon Challenge Frankfurt</span>
                      <br/>
                      <span className={styles.eventdescription}>6 - 11 July 2021</span>
                      <br/>
                      <span className={styles.eventdescription}>Europeana XX: Subtitle-a-thon Challenge Frankfurt</span>
                      <a href="/events#frankfurt">
                        <div className={styles.eventreadmore}>
                          Read more
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={`${styles.griditem} ${styles.eventimagemeeting}`}>
                  <div className={styles.gridcontentwrapper}>
                    <div className={styles.evendateblock}>
                      <span className={styles.eventdateblockdates}>
                        TBA
                      </span>
                      <hr className={styles.evendateblockline}/>
                      <span className={styles.eventdateblockmonth}>
                        Sept.
                      </span>
                    </div>
                    <div className={styles.eventdescriptionblock}>
                      <span className={styles.eventtitle}>Subtitle-a-thon Challenge Rome</span>
                      <br/>
                      <span className={styles.eventdescription}>TBA September 2021</span>
                      <br/>
                      <span className={styles.eventdescription}>Europeana XX: Subtitle-a-thon Challenge Rome</span>
                      <a href="/events#rome">
                        <div className={styles.eventreadmore}>
                          Read more
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={`${styles.griditem} ${styles.eventimagebeach}`}>
                  <div className={styles.gridcontentwrapper}>
                    <div className={styles.evendateblock}>
                      <span className={styles.eventdateblockdates}>
                        26 - 2
                      </span>
                      <hr className={styles.evendateblockline}/>
                      <span className={styles.eventdateblockmonth}>
                        Sept.<br/>-<br/> Oct.
                      </span>
                    </div>
                    <div className={styles.eventdescriptionblock}>
                      <span className={styles.eventtitle}>Subtitle-a-thon Challenge Amsterdam</span>
                      <br/>
                      <span className={styles.eventdescription}>26 September - 2 October 2021</span>
                      <br/>
                      <span className={styles.eventdescription}>Europeana XX: Subtitle-a-thon Challenge Amsterdam</span>
                      <a href="/events#amsterdam">
                        <div className={styles.eventreadmore}>
                          Read more
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className={styles.griditemfindout}>
                    Find all our events &nbsp;<a href="/events" className="font-weight-bold text-white"><u>right here</u></a>   
                </div>
              
            </div>
            <div className="col-1"></div>
          </div>
        </section>

        <section className="container-fluid">
          <div className="row pt-2 pt-lg-4">
            <div className="col-1"></div>
            <div className="col-10 col-lg-5">
              <h2 className={styles.aboutheader}>Awards and Prizes</h2>
              <p className={styles.welcometext}>
              Taking part in our Subtitle-a-thon is a very gratifying experience, but we do not want you to go home empty handed either. That is why each participant of one of the four events will be awarded with a certificate of participation. 
              </p>
              <p className={styles.welcometext}>
              We also want to thank the biggest contributors to our subtitle-a-thons with something more tangible. The top three subtitlers of each marathon will be sent an online gift card, based on the amount of subtitled characters and quality of the subtitles. Specifics for each subtitle-a-thon’s gift cards can be discovered on their event pages. 
              </p>
              <p className={styles.welcometext}>
              After each subtitle-a-thon, the winners of the prizes will be individually contacted by the organisers and their names will be announced on the event page within 5 weekdays. 
              </p>
            </div>
            <div className='col-1 d-lg-none'></div>
            <div className='col-1 d-lg-none'></div>
            <div className="col-10 col-lg-5">
              <img src="/awards.jpg" className={styles.awardsImage}></img>
            </div>
            <div className="col-1"></div>
          </div>
        </section>
      </main>
    </div>
  )
}
