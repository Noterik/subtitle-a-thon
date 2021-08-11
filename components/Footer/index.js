import styles from "./footer.module.css"

const Footer = () => {

    return(
        <footer className={`mt-4 ${styles.footer}`}>
            <div className="row w-100 pt-2">
                <div className="col-1"></div>
                <div className="col-10 d-flex align-items-center flex-wrap">
                    <img src="/cef-logo.png" className={`float-left ${styles.footerimage}`} alt="Co-financed by the Connecting Europe Facility of the European Union"/>
                    <div className="float-left">
                        <a href="#" className={styles.footerlink}>Contact us</a><br/>
                        <a href="/terms-of-use"  className={styles.footerlink}>Terms and policies</a>
                    </div>
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
            <small className={`col-10 ${styles.footertext}`}>
                The Subtitle-a-thon website currently does not support people with disabilities. We are working on a solution to this issue.
            </small>
            <div className="col-1"></div>
            </div>
        </footer>
    )
}

export default Footer