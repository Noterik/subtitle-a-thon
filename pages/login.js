import Head from 'next/head'
import NavigationBar from '../components/NavigationBar'
import React, { useState } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import styles from "../styles/Login.module.css"
import messages from "../i18n/en.json"
import Cookie from '../components/Cookie';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
const eye = <FontAwesomeIcon icon={faEye} />;
const eyeSlash = <FontAwesomeIcon icon={faEyeSlash} />

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const LoginError = ({ name, messages }) => {
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

const LoginForm = () => {
    const [ waitingForResponse, setWaitingForResponse ] = useState(false);

    const methods = useForm({
        mode: "onChange",
    })
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState,
    } = methods
  
    const onSubmit = data => {
        setWaitingForResponse(true);

        fetch(apiUrl+"/user/login",
            {
                method: "POST",
                credentials: "include",
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
                    fetch(apiUrl+"/user/authenticate",
                    {
                        method: "GET",
                        credentials: "include",
                    }).then(response => response.json())
                    .then(response => {
                        if (!response.error && response.success) {
                            Cookie.setCookie('user', JSON.stringify(response.success));
                            window.location.href = '/profile';
                        }
                    });
                }
                setWaitingForResponse(false);
            });
    }

    const [passwordShown, setPasswordShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    return (
        <div className="main-container">
            <Head>
            <title>Subtitle-a-thon | Login</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700" rel="stylesheet" />
            <link href="https://fonts.cdnfonts.com/css/norwester" rel="stylesheet" />
            </Head>
    
            <NavigationBar page="login"/>
            
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
                            <h1 className={styles.header}>Login</h1>
                            <div className={`pt-2 ${styles.subheader}`}>Don't have an account? <a href="/registration" className={styles.link}>Register</a></div>

                            <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                    <label className={styles.registerFieldName}>Username</label>
                                    <input 
                                        className={styles.formInput}
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        ref={register({
                                            required: true,
                                            minLength: 1
                                        })}
                                        onChange={() => {
                                            clearErrors("loginmessage")
                                        }}
                                    />
                                    <label className={styles.registerFieldName}>Password</label>
                                    <div className={styles.passwordwrapper}>
                                        <input 
                                            className={styles.formInput}
                                            id="password"
                                            name="password"
                                            type={passwordShown ? "text" : "password"}
                                            required
                                            ref={register({
                                                required: true,
                                                minLength: 1
                                            })}
                                            onChange={() => {
                                                clearErrors("loginmessage")
                                            }}
                                        />
                                        <i className={styles.eye} onClick={togglePasswordVisiblity}>{passwordShown ? eyeSlash : eye}</i>
                                    </div>
                                    <LoginError name="loginmessage" messages={messages} />
                                    <div className="pt-4">
                                        <a href="/forgot-password" className={styles.link2}>Forgot password?</a>
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.submitbutton}
                                        disabled={formState.isSubmitting || !formState.isValid || waitingForResponse }
                                    >
                                        Login
                                    </button>        
                                </form>
                            </FormProvider>

                        </div>
                        <div className={`col-1 ${styles.hiddenColumn}`}></div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default LoginForm