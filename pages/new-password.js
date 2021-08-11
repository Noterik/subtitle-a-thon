import Head from 'next/head'
import NavigationBar from '../components/NavigationBar'
import React, { useState, useContext, useEffect } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import styles from "../styles/NewPassword.module.css"
import messages from "../i18n/en.json"
import Loader from 'react-loader-spinner';
import { useRouter } from 'next/router'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
const eye = <FontAwesomeIcon icon={faEye} />;
const eyeSlash = <FontAwesomeIcon icon={faEyeSlash} />

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const ValidResetId = React.createContext(false);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

const FormError = ({ name, messages }) => {
    const { errors } = useFormContext()

    const errorField = errors[name]
      ? `form_${name}_error_${errors[name].type}`
      : null
  
    return errorField ? (
        <div className={styles.invalidinput}>
            <ReactMarkdown className={styles.message} source={messages[errorField]} />
        </div>
    ) : null
}

function validatePassword(password) {
    return passwordRegex.test(password);
}

const NewPassword = () => {
    const router = useRouter();
    const { query } = router;
    const [ validId, setValidId ] = useState(false);
    const [ waitingForContent, setWaitingForContent ] = useState(true);

    useEffect(() => {
        if(!router.isReady) return;

        async function fetchData() {
            let resetid = "";

            if (query.id) {
                resetid = query.id;
            }

            fetch(apiUrl+"/user/reset/"+resetid,
            {
                method: "GET"
            }).then(response => response.json())
            .then(response => {
                if (response.error) {
                    setValidId(false);
                    setWaitingForContent(false);
                } else if (response.success) {
                    //Valid reset id
                    setValidId(true);
                } 
                setWaitingForContent(false);
            });
        }

        fetchData();
    }, [router.isReady]);

    return (
        <div className="main-container">
            <Head>
            <title>Subtitle-a-thon | New password</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
            <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>

            <NavigationBar page="forgot password"/>
        
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
                        <div className="col-0 col-lg-7">

                        </div>
                        <div className={`col-1 ${styles.hiddenColumn}`}></div>
                        <div className="col-10 col-lg-5 col-xl-3">
                            <h1 className={styles.header}>Choose a new password</h1>
                            {waitingForContent ? 
                                <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} /> :
                                <ValidResetId.Provider value={validId}><NewPasswordContent /></ValidResetId.Provider> 
                            }
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

const NewPasswordContent = () => {
    const validId = useContext(ValidResetId);

    return (
        <div>
            {validId ? 
                <NewPasswordForm/> : 
                <InvalidResetId/> 
            }
        </div>
    );
}

const InvalidResetId = () => {
    return (
        <div className={`pt-4 text-center ${styles.invalidResetId}`}>
            This reset id is no longer valid, please request a new <a href="/forgot-password">password reset</a>
        </div>
    );
}

const NewPasswordForm = () => {
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
    } = methods

    const router = useRouter();
    let resetid = "";
    if (router.query.id) {
        resetid = router.query.id;
    }

    const onSubmit = data => {
        setWaitingForResponse(true);
        
        fetch(apiUrl+"/user/newpassword",
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
                setSuccessfullReset(true);
            } else {
                //unknown error, server down?
            }
            setWaitingForResponse(false);
        });
    }

    const [passwordShown, setPasswordShown] = useState(false);
    const [repeatPasswordShown, setRepeatPasswordShown] = useState(false);
    const [ successfullReset, setSuccessfullReset ] =  useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const toggleRepeatPasswordVisiblity = () => {
        setRepeatPasswordShown(repeatPasswordShown ? false : true);
    };

    return (
        <FormProvider {...methods}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
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
                        <FormError name="password" messages={messages} />
                        <label className={styles.registerFieldName}>Repeat Password</label>
                        <div className={styles.passwordwrapper}>
                            <input 
                                className={styles.formInput}
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
                        <FormError name="controlpassword" messages={messages} />
                        <input
                            id="resetid"
                            name="resetid"
                            type="hidden"
                            value={resetid}
                            ref={register()}
                        />
                        <br/>
                        
                        {successfullReset ?
                                        <div className={styles.forgotPasswordSend}>
                                            Your password has been succesfully updated, you can now <a href="/login">login</a>
                                        </div>
                                    :
                            <button
                                type="submit"
                                className={styles.submitbutton}
                                disabled={formState.isSubmitting || !formState.isValid || !formState.isDirty || waitingForResponse }
                            >
                                Reset password
                            </button>
                        }
                    </form>
                </FormProvider>
    );
}

export default NewPassword