import Head from 'next/head'
import styles from "../styles/TermsOfUse.module.css"
import NavigationBar from '../components/NavigationBar'

const TermsOfUse = () => {
    return(
        <div className='main-container'>
            <Head>
                <title>Subtitle-a-thon | Terms of Use</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
                <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="terms-of-use"/>

            <div className="row w-100 pt-2">
                <div className="col-1"></div>
                <div className="col-10">
                    <h2 className={styles.header}>Terms of Use</h2>
                    <p className={`pt-4 ${styles.text}`}>
                        The Subtitle-a-thon.eu website is a service product of the EUscreen Foundation acting on behalf of the partners of the Europeana XX: Century of Change project, 
                        especially the four local hosts of the Europeana XX: Subtitle-a-thon Challenges - Deutsches Filminstitut & Filmmuseum - DFF (Germany), The Istituto Luce Cinecittà - LUCE (Italy),
                         the National Film Archive - Audiovisual Institute - FINA (Poland) and, the Netherlands Institute for Sound and Vision - NISV (The Netherlands). 
                    </p>
                    <p className={styles.text}>
                        Europeana XX: Subtitle-a-thon Challenges are four online events held between June and september 2021.
                    </p>
                    <p className={styles.text}>
                        These terms, together with the Terms of User Contributions, establish the conditions that users accept when contributing content to the Subtitle-a-thon website, EUscreen.eu and Europeana.eu. Under these terms: 
                    </p>
                    <ol className={styles.list}>
                        <li>The EUscreen Foundation is entitled at all times to amend or supplement these Terms.</li>
                        <li>These terms and conditions are governed by Dutch law. Disputes in relation to the use of this website can only be submitted to the competent court in Amsterdam.</li>
                        <li>This website is compiled and updated with the utmost care. The EUscreen Foundation, acting on behalf of of all partners of the Europeana XX: Century of Change project, accepts no liability for any claims, penalties, loss or expenses arising from: any reliance placed on the website or content; the use or inability to use the website or if the website is not in working order; the downloading of any materials from the website; or any unauthorised access to or alteration to the website.</li>
                        <li>The Euscreen Foundation assumes no liability for subtitles, messages, information or other content that are posted on this website by third parties. The EUscreen Foundation reserves the right to remove content that has been posted on this website by third parties.</li>
                        <li>Non-public domain audiovisual content on this website is protected by copyright. </li>
                        <li>The user assumes all responsibility to use the content in line with the licence and/or permissions associated with the content. The EUscreen Foundation accepts no liability for the user's  use of the content found in and on this website.</li>
                        <li><p>If you are the owner of the copyright in any of the content on this website and you do not agree with  your content appearing on the website, please contact us with the information requested below:</p>
                            <ul>
                                <li>Your contact details;</li>
                                <li>Enough information for us to identify the relevant content;</li>
                                <li>What your complaint is and why you are notifying us;</li>
                                <li>Confirmation that you are the owner of the copyright in the work or are authorised by the owner to contact us.</li>
                            </ul>
                            When we receive your complaint, we will acknowledge receipt by email. We will investigate the complaint and depending on our findings may remove the relevant works. Your complaint can be sent to info@euscreen.eu.
                        </li>
                        <li>
                            <p>Other than personally identifiable information, which is covered under our Privacy Policy, any material you post to the website shall be considered non-confidential and non-proprietary.</p>
                            <p>You are prohibited from adding, posting or transmitting to or from the website any material or information:</p>
                            <ul>
                                <li>that is threatening, defamatory, obscene, indecent, seditious, offensive, pornographic, abusive, liable to incite racial hatred, discriminatory, menacing, scandalous, inflammatory, blasphemous, in breach of confidence, in breach of privacy or which may cause annoyance or inconvenience; or</li>
                                <li>which constitutes or encourages conduct that would be considered a criminal offence, give rise to civil liability, or otherwise be contrary to the law of or infringe the rights of any third party, in or any country in the world; or</li>
                                <li>which is technically harmful (including, without limitation, computer viruses, logic bombs, Trojan horses, worms, harmful components, corrupted data or other malicious software or harmful data); or</li>
                                <li>that goes against the declared objectives of the campaigns.</li>
                            </ul>
                            You may not misuse the website (including, without limitation, by hacking).
                        </li>
                        <li>
                        The EUscreen Foundation has the right to block any user’s account and/or remove any material contributed by the User if, in our opinion, such material does not comply with the provisions set out above or for any other reason. In addition, the EUscreen Foundation shall fully cooperate with any law enforcement authorities or court order requesting or directing us to disclose the identity or locate anyone posting any material in breach of the provisions set out above. The EUscreen Foundation accepts no liability for the consequences of such removal.
                        </li>
                    </ol>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-2">
                <div className="col-1"></div>
                <div className="col-10">
                    <h2 className={styles.header}>Terms for Users Contributions</h2>
                    <p className={styles.text}>
                    These terms establish the conditions that users accept when contributing content to the Subtitle-a-thon website, EUscreen.eu and Europeana.eu. Under these terms:
                    </p>
                    <ol className={styles.list}>
                        <li>Subtitles should be understood as written captions to audiovisual content that translate and/or transcribe the dialogue or narrative.</li>
                        <li>According to the Terms for User Contributions for the Subtitle-a-thon.eu website, when a User provides subtitles on audiovisual clips during online or physical subtitle-a-thons, she/he irrevocably accepts not to claim any copyright or neighbouring right that might arise as a result of her/his act of subtitling. Irrespective of this, the organisers will make best efforts to attribute the contribution to the User. The resulting subtitling will be labelled with the copyright statement applied to the content it subtitles and may be reused on the EUscreen.eu and Europeana.eu websites.</li>
                        <li>By creating an account on the Subtitle-a-thon website, the User automatically indicates acceptance of these terms and conditions. If you do not agree with these policies, please do not contribute subtitles to the Subtitle-a-thon website.</li>
                        <li>Users' contributions delivered during the Europeana XX: Subtitle-a-thon Challenges will be rewarded with certificates issued for all the participants of the events by their local hosts (FINA, NISV, LUCE, DFF). On top of that, the local hosts will award with online gift cards the top three subtitlers of each subtitle-a-thon event based on the amount and quality of the subtitles. The names of the winners will be announced on the event page within 5 weekdays.</li>
                    </ol>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-2">
                <div className="col-1"></div>
                <div className="col-10">
                    <h2 className={styles.header}>Privacy Policy</h2>
                    <p className={styles.text}>The EUscreen Foundation takes the privacy of its users very seriously and will process and use information about you in a secure manner.</p>
                    <p className={styles.text}>Your personal data gathered by this form will be used by the EUscreen Foundation and the local hosts only within the context of the Europeana XX: Subtitle-a-thon event.</p>
                    <p className={styles.text}>Read our privacy policy: <a href="https://euscreen.eu/privacy.html" className={styles.link} target="_blank">https://euscreen.eu/privacy.html</a>.</p>
                </div>
            </div>
        </div>
    )
}


export default TermsOfUse