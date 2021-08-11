import React, { useEffect, useContext, useState } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import Head from 'next/head'
import styles from "../styles/SignUp.module.css"
import NavigationBar from '../components/NavigationBar'
import messages from "../i18n/en.json"
const emailValidator = require("email-validator");
import { useRouter } from "next/router"
import Loader from 'react-loader-spinner';

import classnames from 'classnames';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
const eye = <FontAwesomeIcon icon={faEye} />;
const eyeSlash = <FontAwesomeIcon icon={faEyeSlash} />

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const ValidSignUpId = React.createContext(false);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

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

function validatePassword(password) {
    return passwordRegex.test(password);
}

const SignUpForm = () => {
    const router = useRouter();
    const { query } = router;
    const [ validId, setValidId ] = useState(false);
    const [ waitingForContent, setWaitingForContent ] = useState(true);
    const [ email, setEmail ] = useState("");

    useEffect(() => {
        if(!router.isReady) return;

        async function fetchData() {
            let signupid = "";

            if (query.id) {
                signupid = query.id;
            }

            fetch(apiUrl+"/user/signup/"+signupid,
            {
                method: "GET"
            }).then(response => response.json())
            .then(response => {
                if (response.error) {
                    setValidId(false);
                    setWaitingForContent(false);
                } else if (response.success) {
                    //Valid signup id
                    if (response.success.firststepcompleted) {
                        //first step already completed, redirect to second step
                        window.location.href = '/sign-up-profile?id='+signupid;
                    } else {
                        setEmail(response.success.email);
                        setValidId(true);
                        setWaitingForContent(false);
                    }
                } 
            });
        }

        fetchData();
    }, [router.isReady]);

    return (
    <div className="main-container">
        <Head>
          <title>Subtitle-a-thon | Sign up</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
          <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
        </Head>
  
        <NavigationBar page="signup"/>
        
        <div className={styles.leftbackground}>
            <div className={styles.title}>
                <h1 className={styles.titletext}><span className={styles.purple}>Subtitle</span> the Past,</h1>
                <h1 className={styles.titletext}>Translate for <span className={styles.purple}>the Future</span></h1>
            </div>
            
        </div>
        <div className={styles.rightbackground}></div>

        <main>
            <section className="container-fluid">
                <div className="row pt-4">
                    <div className={`col-0 col-lg-7 ${styles.backgroundleft}`}>

                    </div>
                    <div className={`col-1 ${styles.hiddenColumn}`}></div>
                    <div className="col-10 col-lg-5 col-xl-3">
                        <h1 className={styles.header}>Sign up</h1>
                        {waitingForContent ? 
                            <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} /> :
                            <ValidSignUpId.Provider value={validId}><SignUpContent email={email}/></ValidSignUpId.Provider> 
                        }
                        </div>
                    <div className={`col-1 ${styles.hiddenColumn}`}></div>
                </div>
            </section>
        </main>
    </div>
    );
}

const SignUpContent = ( {email} ) => {
    const validId = useContext(ValidSignUpId);

    return (
        <div>
            {validId ? 
                <SignupForm email={email} /> : 
                <InvalidSignUpId/> 
            }
        </div>
    );
}

const InvalidSignUpId = () => {
    return (
        <div className={`pt-4 text-center ${styles.invalidResetId}`}>
            This signup id is not valid, did you get an email about completing your signup? Please contact <a href="mailto:support@subtitleathon.eu">support@subtitleathon.eu</a>
        </div>
    );
}

const SignupForm = ( {email} ) => {
    const [ waitingForResponse, setWaitingForResponse ] = useState(false);

    const methods = useForm({
        mode: "onChange",
    })

    const {
        register,
        watch,
        handleSubmit,
        setError,
        formState,
        errors
    } = methods;

    const router = useRouter();
    let signupid = "";
    if (router.query.id) {
        signupid = router.query.id;
    }

    const onSubmit = data => {
        setWaitingForResponse(true);
        
        fetch(apiUrl+"/user/create",
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
                        type: "server" 
                    });
                });
            } else if (response.success) {
                window.location.href = '/sign-up-profile?id='+signupid;
            } else {
                //unknown error, server down?
            }
            setWaitingForResponse(false);
        });
    }

    const passwordClassnames = classnames(styles.formInput, styles.passwrapper);

    const [passwordShown, setPasswordShown] = useState(false);
    const [repeatPasswordShown, setRepeatPasswordShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const toggleRepeatPasswordVisiblity = () => {
        setRepeatPasswordShown(repeatPasswordShown ? false : true);
    };

    return (
        <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="pt-2">
                <label className={styles.registerFieldName}>Username</label>
                <input 
                    className={styles.formInput}
                    id="username"
                    name="username"
                    type="text"
                    placeholder=""
                    required
                    ref={register({ 
                        required: true,
                        minLength: 1,
                        maxLength: 50,
                    })}
                    style={{ border: errors.username ? '1px solid red' : '' }}
                />
                <InputError field="username" messages={messages} />

                <label className={styles.registerFieldName}>Email address</label>
                <input 
                    className={styles.formInputDisabled}
                    id="email"
                    name="email"
                    type="email"
                    placeholder=""
                    value={email}
                    readOnly
                    required
                    ref={register({
                        required: true,
                        validate: emailValidator.validate,
                    })}
                    style={{ border: errors.email ? '1px solid red' : '' }}
                />
                <InputError field="email" messages={messages} />
                
                <label className={styles.registerFieldName}>Password</label>
                <div className={styles.passwordwrapper}>
                    <input 
                        className={styles.formInput}
                        id="password"
                        name="password"
                        type={passwordShown ? "text" : "password"}
                        placeholder="Must be at least 8 characters"
                        required
                        ref={register({
                            required: true,
                            validate: validatePassword
                        })}
                        style={{ border: errors.password ? '1px solid red' : '' }}
                    />
                    <i className={styles.eye} onClick={togglePasswordVisiblity}>{passwordShown ? eyeSlash : eye}</i>
                </div>
                <InputError field="password" messages={messages} />
                
                <label className={styles.registerFieldName}>Repeat Password</label>
                <div className={styles.passwordwrapper}>
                    <input 
                        className={passwordClassnames}
                        id="controlpassword"
                        name="controlpassword"
                        type={repeatPasswordShown ? "text" : "password"}
                        placeholder="Must be at least 8 characters"
                        required
                        ref={register({
                            required: true,
                            validate: (value) => {
                                return value === watch("password");
                            }
                        })}
                        style={{ border: errors.controlpassword ? '1px solid red' : '' }}
                    />
                    <i className={styles.eye} onClick={toggleRepeatPasswordVisiblity}>{repeatPasswordShown ? eyeSlash : eye}</i>
                </div>
                <InputError field="controlpassword" messages={messages} />
                
                <input
                    id="signupid"
                    name="signupid"
                    type="hidden"
                    value={signupid}
                    ref={register()}
                />

                <button
                    type="submit"
                    className={styles.submitbutton}
                        disabled={formState.isSubmitting || !formState.isValid || waitingForResponse}
                    >
                        Next step    
                </button>

            </form>
        </FormProvider>
    );
}                  
                    

export default SignUpForm