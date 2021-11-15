import styles from "./footer.module.css"

const Footer = () => {

    return(
        <footer className={`mt-4 ${styles.footer}`}>
            <div className="row w-100 pt-2">
                <div className="col-1"></div>
                <div className="col-8 d-flex align-items-center flex-wrap">
                    <img src="/cef-logo.png" className={`float-left ${styles.footerimage}`} alt="Co-financed by the Connecting Europe Facility of the European Union"/>
                    <div className="float-left">
                        <a href="#" className={styles.footerlink}>Contact us</a><br/>
                        <a href="/terms-of-use"  className={styles.footerlink}>Terms and policies</a>
                    </div>
                </div>
                <div className="col-2">
                    Powered by <a href="https://www.noterik.nl" target="_blank"><img src="/partner/noterik-logo-small.png" alt="Noterik logo" className={styles.poweredbynoteriklogo}/></a>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-2">
            <div className="col-1"></div>
            <small className={`col-10 ${styles.footertext}`}>
                Subtitle-a-thons are part of the Europeana XX: Century of Change project, co-financed by the Connecting Europe Facility Programme of the European Union.
            </small>
            <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-2">
            <div className="col-1"></div>
            <small className={`col-10 ${styles.footertext} font-italic`}>
                The intent of the subtitle-a-thons events is to engage language learners and students in a playful way with multilinguality and a/v archival material, while raising awareness about the value of multilingual access to AV archival footage. The online gamified nature of these subtitle-a-thons is not intended to compete with or replace professional level translation. 
            </small>
            <div className="col-1"></div>
            </div>
            <div className="row w-100 pt-2">
            <div className="col-1"></div>
            <small className={`col-10 ${styles.footertext}`}>
                The Subtitle-a-thon website currently does not support people with disabilities. We are working on a solution to this issue.
            </small>
            <div className="col-1"></div>
            </div>
        </footer>
    )
}

export default Footer