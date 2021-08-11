import Head from 'next/head'
import NavigationBar from '../components/NavigationBar'
import React, { useState } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import styles from "../styles/ForgotPassword.module.css"
import messages from "../i18n/en.json"

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const ForgotPasswordError = ({ name, messages }) => {
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

const ForgotPassword = () => {
    const [ waitingForResponse, setWaitingForResponse ] = useState(false);
    const [ successfullReset, setSuccessfullReset ] =  useState(false);
    const [ resetEmail, setResetEmail ] =  useState("");

    const methods = useForm({
        mode: "onBlur",
    })
    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState
    } = methods
  
    const validateUsernameOrEmail = (value) => {
        if (getValues("username") !== "" || getValues("email") != "") {
            return true;
        }
        return false;
    }
    
    const onSubmit = data => {
        setWaitingForResponse(true);

        fetch(apiUrl+"/user/forgotpassword",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                body: JSON.stringify(data)
        }).then(response => response.json())
        .then(response => 
            {
                if (response.error) {
                    Object.keys(response.error).map((key) => {
                        setError(key, {
                            type: "server" 
                        });
                    });
                } else if (response.success) {
                    setResetEmail(response.success.email);
                    setSuccessfullReset(true); 
                }
                setWaitingForResponse(false);
            }
        );
    }

    return (
        <div className="main-container">
            <Head>
            <title>Subtitle-a-thon | Forgot password</title>
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
                            <h1 className={styles.header}>Forgot Password</h1>

                            <FormProvider {...methods}>
                                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                                <label className={styles.registerFieldName}>Your username</label>
                                    <input 
                                        className={styles.formInput}
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        ref={register({
                                            required: false,
                                            validate: validateUsernameOrEmail
                                        })}
                                    />
                                    <label className={styles.registerFieldName}>Or email address</label>
                                    <input 
                                        className={styles.formInput}
                                        id="email"
                                        name="email"
                                        type="text"
                                        required
                                        ref={register({
                                            required: false,
                                            validate: validateUsernameOrEmail
                                        })}
                                    />
                                    <br/>
                                    <ForgotPasswordError name="forgotpassword" messages={messages} />
                                    {successfullReset ?
                                        <div className={styles.forgotPasswordSend}>
                                            An email with reset instructions has been send to {resetEmail}
                                        </div>
                                    :
                                        <button
                                            type="submit"
                                            className={styles.submitbutton}
                                            disabled={formState.isSubmitting || !formState.isDirty || waitingForResponse }
                                        >
                                            Reset password
                                        </button>
                                    }
                                </form>
                            </FormProvider>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ForgotPassword