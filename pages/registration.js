import React, { useEffect, useState } from "react"
import { useForm, useFormContext, FormProvider, Controller } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import Head from 'next/head'
import styles from "../styles/Registration.module.css"
import NavigationBar from '../components/NavigationBar'
import messages from "../i18n/en.json"
const emailValidator = require("email-validator");
import { useRouter } from "next/router"
import Cookie from "../components/Cookie"
import Select from "react-select";
//const languages = require('../i18n/lang.json');
const languages = require('../i18n/lang_rome.json');
const languagesForeign = require('../i18n/lang_rome_foreign.json');

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const InputError = ({ field, messages }) => {
    const { errors, formState } = useFormContext()

    const errorField = errors[field]
      ? `form_${field}_error_${errors[field].type}`
      : null    

    return formState.touched[field] && errorField ? (
        <div className={styles.invalidinput}>
            <ReactMarkdown className={styles.message} source={messages[errorField]} />
        </div>
    ) : null
}

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

const Registration = () => {
    const router = useRouter();
    const [ waitingForResponse, setWaitingForResponse ] = useState(false);
    const [ successfulSubmit, setSuccessfulSubmit ] = useState(false);

    useEffect(() => {      
        async function fetchData() {
            //check if user is logged in
            const user = Cookie.getCookie("user");

            //valid user
            if (user !== null) {
                router.push("/profile");
            }
        }

        fetchData();
    }, []);

    const methods = useForm({
        mode: "onChange",
        reValidateMode: "onBlur"
    })
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        formState,
        errors
    } = methods

    const onSubmit = data => {
        setWaitingForResponse(true);
        
        fetch(apiUrl+"/user/registrate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(response => {
            if (response.error) {
                Object.keys(response.error).map((key) => {
                    setError(key, {
                        type: "register" 
                    });
                });
            } else if (response.success) {
                setSuccessfulSubmit(true);

            } else {
                //unknown error, server down?
            }
            setWaitingForResponse(false);
        });
    }

    const locales = languages.locales;
    const foreignLocales = languagesForeign.locales;

    return (
        <div className="main-container">
            <Head>
              <title>Subtitle-a-thon | Registration</title>
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
              <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>
      
            <NavigationBar page="registration"/>
                
            <main>
                <section className="container-fluid">
                    <div className="row pt-4">
                        <div className="col-12">
                            <h1 className={styles.header}>Registration Form</h1>
                        </div>
                    </div>
                    <div className="row pt-4">
                        <div className="col-1"></div>
                        <div className="col-5 pt-2">
                            <p className={styles.registrationtext}>
                                Join us for the Europeana XX: Subtitle-a-thon Challenge Rome and share with us your language and subtitling skills to <span className="font-italic">Subtitle the Past, Translate for the Future</span>.
                            </p>
                            <p className={styles.registrationtext}>
                                The kick-off of the subtitle-a-thon takes place on Saturday 23 of October at 11.00 CET with a one hour and a half introductory session, and runs online for six days with a closing session on Friday October 29 at 17.00 CET. Participation is free of charge.
                            </p>
                            <p className={styles.registrationtext}>
                                Register now.
                            </p>
                            <p className={styles.registrationtext}>
                                Didn't get a response? Check your spam folder for an e-mail from Europeana XX Subtitle-a-thon. No luck? Drop us a line at  <a href="mailto:subtitleathon@cinecittaluce.it">subtitleathon@cinecittaluce.it</a> and we will get back to you as soon as possible. 
                            </p>
                            <p className={styles.registrationtext}>
                                Don’t worry. Your personal data gathered by this form will be used by the local hosts <span className="font-weight-bold">only within the context of the Europeana XX: Subtitle-a-thon event</span>.
                            </p>
                            <hr/>
                            <p className={styles.registrationtext}>
                                Unisciti a noi per l’Europeana XX: Subtitle-a-thon Challenge di Roma e condividi con noi le tue abilità linguistiche e di sottotitolazione per <span className="font-italic">Sottotitolare il passato, Tradurre per il futuro</span>.
                            </p>
                            <p className={styles.registrationtext}>
                            Il lancio della subtitle-a-thon si svolgerà online, sabato 23 ottobre alle ore 11.00, con una sessione introduttiva di un'ora e mezza. La competizione online durerà sei giorni e si concluderà con una sessione finale, venerdì 29 ottobre alle ore 17.00. La partecipazione è gratuita.
                            </p>
                            <p className={styles.registrationtext}>
                                Iscriviti ora!
                            </p>
                            <p className={styles.registrationtext}>
                                Non hai ricevuto una email di conferma? Controlla nella cartella spam se hai un messaggio da Europeana XX Subtitle-a-thon. Ancora niente? Allora scrivici a <a href="mailto:subtitleathon@cinecittaluce.it">subtitleathon@cinecittaluce.it</a> e ti risponderemo al più presto.
                            </p>
                            <p className={styles.registrationtext}>
                                Non preoccuparti, i dati personali raccolti in questo modulo saranno utilizzati dagli organizzatori <span className="font-weight-bold">solo nel contesto dell'evento Europeana XX: Subtitle-a-thon</span>.
                            </p>
                        </div>
                        <div className="col-1"></div>
                        <div className="col-4">
                            <p className={`font-weight-bold ${styles.registrationtext}`}>
                            Registration closed
                            </p>
                        </div>
                        <div className="col-1"></div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Registration

/*

{!successfulSubmit ? (
                            <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmit(onSubmit)} className="registration-form pt-2">
                                    <label className={`${styles.registerFieldName}`}>Full name</label>
                                    <input 
                                        className={styles.formInput}
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.fullname ? '1px solid red' : '' }}
                                    />
                                    <InputError field="fullname" messages={messages} />
    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Email</label>
                                    <input 
                                        className={styles.formInput}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder=""
                                        required
                                        ref={register({
                                            required: true,
                                            validate: emailValidator.validate,
                                        })}
                                        style={{ border: errors.email ? '1px solid red' : '' }}
                                    />
                                    <InputError field="email" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Nationality</label>
                                    <input 
                                        className={styles.formInput}
                                        id="nationality"
                                        name="nationality"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.nationality ? '1px solid red' : '' }}
                                    />
                                    <InputError field="nationality" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Native language(s)</label>
                                    <Controller
                                        control={methods.control}
                                        id="nativelanguages"
                                        name="nativelanguages"
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
                                    
                                    <InputError field="nativelanguages" messages={messages} />

                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Language(s) spoken fluently</label>
                                    <Controller
                                        control={methods.control}
                                        id="foreignlanguages"
                                        name="foreignlanguages"
                                        placeholder="Pick one or more languages"
                                        rules={{ required: true }}
                                        register={register}
                                        setValue={setValue}
                                        as={
                                            <Select
                                                name="foreignlanguagesselect"  
                                                className={styles.select}
                                                classNamePrefix={styles.select} 
                                                options={foreignLocales}
                                                getOptionLabel={(option) => option.name}
                                                getOptionValue ={(option) => option.iso}
                                                isMulti="true"
                                                styles={customSelectStyle}
                                                onChange={val => onChange(val.value)}
                                            />
                                        }
                                    />
                                    <InputError field="foreignlanguages" messages={messages} />

                                    <div className={`pt-4 ${styles.termwrapper}`}>
                                        <label htmlFor="terms">
                                            <input
                                                className={styles.formCheckbox}
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                required
                                                ref={register({
                                                    required: true
                                                })}
                                            />
                                            <span>
                                                <a href="/terms-of-use" target="_blank" className={styles.link2}>
                                                    I accept the Terms of Use
                                                </a>
                                            </span>
                                        </label>    
                                        <InputError field="terms" messages={messages} />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.submitbutton}
                                        disabled={formState.isSubmitting || !formState.isValid ||waitingForResponse}
                                    >
                                        Sign up        
                                    </button>
                                </form>
                            </FormProvider> )
                            : (
                                <div className="registration-success pt-4">
                                    <p>
                                        <span className="font-weight-bold">All set!</span>
                                    </p>
                                    <p>
                                        Confirmation of your registration is on its way to your inbox.
                                    </p>
                                    <p>
                                        Within few days you’ll get a message from us confirming if you can join us in the Europeana XX: Subtitle-a-thon Challenge Rome.
                                    </p>
                                    <p>
                                        Questions? We’re here to help: <a href="mailto:subtitleathon@cinecittaluce.it">subtitleathon@cinecittaluce.it</a>
                                    </p>
                                    <hr/>
                                    <p>
                                        <span className="font-weight-bold">Tutto a posto!</span>
                                    </p>
                                    <p>
                                        Riceverai a breve la conferma della registrazione nella tua casella di posta.
                                    </p>
                                    <p>
                                        Entro pochi giorni riceverai un messaggio da parte nostra che ti confermerà se sei tra i partecipanti selezionati per l'Europeana XX: Subtitle-a-thon Challenge Rome.
                                    </p>
                                    <p>
                                        Domande? Scrivici pure a: <a href="mailto:subtitleathon@cinecittaluce.it">subtitleathon@cinecittaluce.it</a>
                                    </p>
                                </div> 
                            )}


{!successfulSubmit ? (
                            <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmit(onSubmit)} className="registration-form pt-2">
                                    <label className={`${styles.registerFieldName}`}>Full name</label>
                                    <input 
                                        className={styles.formInput}
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.fullname ? '1px solid red' : '' }}
                                    />
                                    <InputError field="fullname" messages={messages} />
    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Email</label>
                                    <input 
                                        className={styles.formInput}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder=""
                                        required
                                        ref={register({
                                            required: true,
                                            validate: emailValidator.validate,
                                        })}
                                        style={{ border: errors.email ? '1px solid red' : '' }}
                                    />
                                    <InputError field="email" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Nationality</label>
                                    <input 
                                        className={styles.formInput}
                                        id="nationality"
                                        name="nationality"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.nationality ? '1px solid red' : '' }}
                                    />
                                    <InputError field="nationality" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Native language(s)</label>
                                    <Controller
                                        control={methods.control}
                                        id="nativelanguages"
                                        name="nativelanguages"
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
                                    
                                    <InputError field="nativelanguages" messages={messages} />

                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Language(s) spoken fluently</label>
                                    <Controller
                                        control={methods.control}
                                        id="foreignlanguages"
                                        name="foreignlanguages"
                                        placeholder="Pick one or more languages"
                                        rules={{ required: true }}
                                        register={register}
                                        setValue={setValue}
                                        as={
                                            <Select
                                                name="foreignlanguagesselect"  
                                                className={styles.select}
                                                classNamePrefix={styles.select} 
                                                options={locales}
                                                getOptionLabel={(option) => option.name}
                                                getOptionValue ={(option) => option.iso}
                                                isMulti="true"
                                                styles={customSelectStyle}
                                                onChange={val => onChange(val.value)}
                                            />
                                        }
                                    />
                                    <InputError field="foreignlanguages" messages={messages} />

                                    <div className={`pt-4 ${styles.termwrapper}`}>
                                        <label htmlFor="terms">
                                            <input
                                                className={styles.formCheckbox}
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                required
                                                ref={register({
                                                    required: true
                                                })}
                                            />
                                            <span>
                                                <a href="/terms-of-use" target="_blank" className={styles.link2}>
                                                    I accept the Terms of Use
                                                </a>
                                            </span>
                                        </label>    
                                        <InputError field="terms" messages={messages} />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.submitbutton}
                                        disabled={formState.isSubmitting || !formState.isValid ||waitingForResponse}
                                    >
                                        Sign up        
                                    </button>
                                </form>
                            </FormProvider> )
                            : (
                                <div className="registration-success pt-4">
                                    <p>
                                        <span className="font-weight-bold">All set!</span>
                                    </p>
                                    <p>
                                        Confirmation of your registration is on its way to your inbox.
                                    </p>
                                    <p>
                                        Within 5 days you’ll get a message from us confirming if you can join us in the  Europeana XX: Subtitle-a-thon Challenge Amsterdam.
                                    </p>
                                    <p>
                                        Questions? We’re here to help: <a href="mailto:subtitles@euscreen.eu">subtitles@euscreen.eu</a>
                                    </p>
                                    <hr/>
                                    <p>
                                        <span className="font-weight-bold">Helemaal klaar!</span>
                                    </p>
                                    <p>
                                        Je krijgt de bevestiging van je inschrijving in je inbox.
                                    </p>
                                    <p>
                                        Binnen 5 dagen ontvang je een bericht van ons waarin we bevestigen of je mee kunt doen aan de Europeana XX: Subtitle-a-thon Challenge Amsterdam.
                                    </p>
                                    <p>
                                        Vragen? Wij helpen je graag: <a href="mailto:subtitles@euscreen.eu">subtitles@euscreen.eu</a>
                                    </p>
                                </div> 
                            )}

*/


/*

                        {!successfulSubmit ? (
                            <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmit(onSubmit)} className="registration-form pt-2">
                                    <label className={`${styles.registerFieldName}`}>Full name</label>
                                    <input 
                                        className={styles.formInput}
                                        id="fullname"
                                        name="fullname"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.fullname ? '1px solid red' : '' }}
                                    />
                                    <InputError field="fullname" messages={messages} />
    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Email</label>
                                    <input 
                                        className={styles.formInput}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder=""
                                        required
                                        ref={register({
                                            required: true,
                                            validate: emailValidator.validate,
                                        })}
                                        style={{ border: errors.email ? '1px solid red' : '' }}
                                    />
                                    <InputError field="email" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Nationality</label>
                                    <input 
                                        className={styles.formInput}
                                        id="nationality"
                                        name="nationality"
                                        type="text"
                                        placeholder=""
                                        required
                                        ref={register({ 
                                            required: true,
                                            minLength: 1,
                                            maxLength: 100,
                                        })}
                                        style={{ border: errors.nationality ? '1px solid red' : '' }}
                                    />
                                    <InputError field="nationality" messages={messages} />
                                    
                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Native language(s)</label>
                                    <Controller
                                        control={methods.control}
                                        id="nativelanguages"
                                        name="nativelanguages"
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
                                    
                                    <InputError field="nativelanguages" messages={messages} />

                                    <label className={`${styles.registerFieldName} ${styles.registerFieldNameMargin}`}>Language(s) spoken fluently</label>
                                    <Controller
                                        control={methods.control}
                                        id="foreignlanguages"
                                        name="foreignlanguages"
                                        placeholder="Pick one or more languages"
                                        rules={{ required: true }}
                                        register={register}
                                        setValue={setValue}
                                        as={
                                            <Select
                                                name="foreignlanguagesselect"  
                                                className={styles.select}
                                                classNamePrefix={styles.select} 
                                                options={locales}
                                                getOptionLabel={(option) => option.name}
                                                getOptionValue ={(option) => option.iso}
                                                isMulti="true"
                                                styles={customSelectStyle}
                                                onChange={val => onChange(val.value)}
                                            />
                                        }
                                    />
                                    <InputError field="foreignlanguages" messages={messages} />

                                    <div className={`pt-4 ${styles.termwrapper}`}>
                                        <label htmlFor="terms">
                                            <input
                                                className={styles.formCheckbox}
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                required
                                                ref={register({
                                                    required: true
                                                })}
                                            />
                                            <span>
                                                <a href="/terms-of-use" target="_blank" className={styles.link2}>
                                                    I accept the Terms of Use
                                                </a>
                                            </span>
                                        </label>    
                                        <InputError field="terms" messages={messages} />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.submitbutton}
                                        disabled={formState.isSubmitting || !formState.isValid ||waitingForResponse}
                                    >
                                        Sign up        
                                    </button>
                                </form>
                            </FormProvider> )
                            : (
                                <div className="registration-success pt-4">
                                    <p>
                                        <span className="font-weight-bold">All set!</span>
                                    </p>
                                    <p>
                                        Confirmation of your registration is on its way to your inbox.
                                    </p>
                                    <p>
                                        Within 5 days you’ll get a message from us confirming if you can join us in the  Europeana XX: Subtitle-a-thon Challenge Frankfurt.
                                    </p>
                                    <p>
                                        Questions? We’re here to help: <a href="mailto:subtitleathon@dff.film">subtitleathon@dff.film</a>
                                    </p>
                                    <hr/>
                                    <p>
                                        <span className="font-weight-bold">Alles bereit!</span>
                                    </p>
                                    <p>
                                        Die Bestätigung deiner Anmeldung ist auf dem Weg in dein E-Mail-Postfach.
                                    </p>
                                    <p>
                                        Innerhalb von 5 Tagen erhältst du eine Nachricht von uns, ob du an der Europeana XX: Subtitle-a-thon Challenge Frankfurt teilnehmen kannst.
                                    </p>
                                    <p>
                                        Noch Fragen? Dann schreib uns gerne an: <a href="mailto:subtitleathon@dff.film">subtitleathon@dff.film</a>
                                    </p>
                                </div> 
                            )}



*/