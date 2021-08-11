import Head from 'next/head'
import styles from "../styles/SubtitleEditor.module.css"
import NavigationBar from '../components/NavigationBar'

const SubtitleEditor = () => {

    return(
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Tutorials</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="subtitle editor"/>

            <h1 className={styles.header}>Tutorials</h1>
            <h2 className={styles.subheader}>Subtitle editor</h2>

            <div className="row w-100 pt-5">
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 1.
                    </p>
                    <p className={styles.text}>
                    First, make an account on this website using the login and password sent to you by the subtitle-a-thons organisers. That way you can get access to the videos and easily keep track of your progress. After creating your account, you need to sign in and go to the event page to select the subtitle-a-thon you want to join. On your profile page you can now select the event to which you want to contribute. When the event is live, you can also go to the event page itself to see the videos.     
                    </p>
                </div>
                <div className="col-1"></div>
                <div className="col-6"> 
                    <img src="/tutorial/step1.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
            </div>
            <div className="row w-100 pt-5"></div>
            <div className="row w-100 pt-5">
                <div className="col-6"> 
                    <img src="/tutorial/step2.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 2.
                    </p>
                    <p className={styles.text}>
                    After these steps, you will be redirected to a page where you can select the video and the language in which you want to subtitle. Each event will be dedicated to a preselected number of languages. If the language you prefer is greyed out, this means someone else has already selected this and you cannot choose it.
                    You can also book for one hour up to three videos of your choice you’d like to work on. When you have selected your preferred video and language, you will be redirected to the video editor page.
                    </p>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-5"></div>
            <div className="row w-100 pt-5">
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 3. 
                    </p>
                    <p className={styles.text}>
                    You can zoom in and out with your mouse scroll wheel on the timeline directly below the video to pinpoint the start of your subtitle to 1/100th of a second. Use this to determine the correct starting time. At the bottom of the page, you can now ‘Add Subtitle’. When adding a subtitle, the timing will always default to a 3-second duration, starting from the exact point where the video is paused.
                    </p>
                </div>
                <div className="col-1"></div>
                <div className="col-6"> 
                    <img src="/tutorial/step3.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
            </div>
            <div className="row w-100 pt-5">
                <div className="col-6"> 
                    <img src="/tutorial/step4.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 4.
                    </p>
                    <p className={styles.text}>
                    Below the video, you can now write the subtitle. Make sure your addition is grammatically correct and spelled correctly. After writing the sentence, press enter to save the subtitle.
                    </p>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-5"></div>
            <div className="row w-100 pt-5">
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 5. 
                    </p>
                    <p className={styles.text}>
                    On the progress bar above, you will now see your entered subtitle appear. Here you can adjust the timing by clicking and dragging the start or end time of your subtitle with increments of half a second. You always have the option of editing your subtitle by selecting the subtitle and clicking on the edit symbol. 
                    </p>
                </div>
                <div className="col-1"></div>
                <div className="col-6"> 
                    <img src="/tutorial/step5.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
            </div>
            <div className="row w-100 pt-5">
                <div className="col-6"> 
                    <img src="/tutorial/step6.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 6.
                    </p>
                    <p className={styles.text}>
                    Repeat this process for every subtitle you need. Note that 2 subtitles can never overlap each other!
                    </p>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-5"></div>
            <div className="row w-100 pt-5">
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 7. 
                    </p>
                    <p className={styles.text}>
                    When finishing your subtitles, be sure to double check your text and timings in the video by using the preview button on the left. When you are happy with your subtitles, you need to submit them. This will lock and finalise the translation process. After submitting your final translation, your amount of characters and minutes will be counted. 
                    </p>
                    <p className={`font-weight-bold ${styles.text}`}>
                    Submitted subtitles can no longer be edited! <br/>
                    Make sure you are finished before submitting them! 
                    </p>
                </div>
                <div className="col-1"></div>
                <div className="col-6"> 
                    <img src="/tutorial/step7.png" width="100%" height="100%" style={{objectFit: 'contain'}} />
                </div>
            </div>
            <div className="row w-100 pt-5">
                <div className="col-6"> 
                    
                </div>
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 8.
                    </p>
                    <p className={styles.text}>
                    Your submitted subtitles will go through a quality check performed by language experts and archives who own the videos. 
                    Once edited and approved they might be used as official subtitles. According to the Terms for User Contributions when providing subtitles, 
                    you accept not to claim any copyright or neighbouring right that might arise as a result of your subtitling work. 
                    The resulting subtitling will be labelled with the copyright statement applied to the content it subtitles and may be reused on the <a href="https://euscreen.eu" target="_blank">EUscreen.eu</a> and <a href="https://europeana.eu" target="_blank">Europeana.eu</a> websites.
                    </p>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-5">
                <div className="col-1"></div>
                <div className="col-4">
                    <p className={styles.eventheader}>
                        Step 9. 
                    </p>
                    <p className={styles.text}>
                    Last but not least, we are there to support you. In case you have technical questions you can reach us at <a href="mailto:support@subtitleathon.eu">support@subtitleathon.eu</a>.
                    </p>
                </div>
                <div className="col-1"></div>
                <div className="col-6"> 
                    
                </div>
            </div>
            <div className="row w-100 pt-5"></div>
        </div>
    )
}

export default SubtitleEditor