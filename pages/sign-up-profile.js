import React, { useEffect, useContext, useState } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form" 
import ReactMarkdown from "react-markdown"
import Head from 'next/head'
import styles from "../styles/SignUp.module.css"
import NavigationBar from '../components/NavigationBar'
import messages from "../i18n/en.json"
import { useRouter } from "next/router"
import Loader from 'react-loader-spinner';

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const ValidSignUpId = React.createContext(false);

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

function validateBackground() {
    const backgroundCheckboxes = document.getElementsByName("background");
    let oneChecked = false;

    for (var i = 0, len = backgroundCheckboxes.length; i < len; i++) {
        if (backgroundCheckboxes[i].checked) {
            oneChecked = true;
            break;
        }
    }
    return oneChecked;
}

const SignUpFormProfile = () => {
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
                    if (response.success.firststepcompleted) {
                        //Valid signup id
                        setValidId(true);
                        setWaitingForContent(false);
                        setEmail(response.success.email);
                    } else {
                        //first step not yet completed, redirect to second step
                        window.location.href = '/sign-up?id='+signupid;
                    }
                } 
            });
        }

        fetchData();
    }, [router.isReady]);

    return (
    <div className="main-container">
        <Head>
          <title>Subtitle-a-thon | Profile</title>
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
                    <div className={`col-10 col-lg-5 col-xl-3`}>
                        <h1 className={styles.header}>Your profile</h1>
                        <div className={styles.subheader}>
                            Please fill in this form to allow us to understand your profile and to offer you a better experience.
                        </div>
                        {waitingForContent ? 
                            <Loader type="Oval" className={styles.loadingIcon} color="#3B236A" height={60} width={60} /> :
                            <ValidSignUpId.Provider value={validId}><SignUpProfileContent email={email}/></ValidSignUpId.Provider> 
                        }
                    </div>
                    <div className={`col-1 ${styles.hiddenColumn}`}></div>
                </div>
            </section>
        </main>
    </div>
    );
}

const SignUpProfileContent = ( {email} ) => {
    const validId = useContext(ValidSignUpId);

    return (
        <div>
            {validId ? 
                <SignupProfileForm email={email} /> : 
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

const SignupProfileForm = ( {email} ) => {
    const [ waitingForResponse, setWaitingForResponse ] = useState(false);
    const [ successfullProfile, setSuccessfullProfile ] =  useState(false);
    const [ errorProfile, setErrorProfile ] =  useState(false);

    const methods = useForm({
        mode: "onChange",
    })

    const {
        register,
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
        
        fetch(apiUrl+"/user/profile",
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
                setSuccessfullProfile(true); 
            } else {
                setErrorProfile(true);
            }
            setWaitingForResponse(false);
        });
    }

    const [otherChecked, setOtherChecked] = useState(false);

    return (
        <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="pt-2">
                                <label className={styles.registerFieldName}>Do you know Europeana.eu?</label>
                                <div className={styles.formRadioArea}>
                                    <input
                                        type="radio"
                                        name="europeana"
                                        value="vividuser"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="vividuser"
                                    >
                                        Yes, I am a vivid user
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="europeana"
                                        value="user"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label
                                        htmlFor="user"
                                    >
                                        Yes, but I don't know it very well
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="europeana"
                                        value="no"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="no"
                                    >
                                        No
                                    </label><br/>
                                </div>
                                <InputError field="europeana" messages={messages} />
                                <label className={styles.registerFieldName}>Where do you live?</label>
                                <div>
                                    <input 
                                        className={styles.formInput}
                                        id="location"
                                        name="location"
                                        type="text"
                                        required
                                        ref={register({
                                            required: true,
                                        })}
                                        style={{ border: errors.location ? '1px solid red' : '' }}
                                    />
                                </div>
                                <InputError field="location" messages={messages} />
                                <label className={styles.registerFieldName}>Please select one of the following categories that you feel most comfortable with to describe your gender:</label>
                                <div className={styles.formRadioArea}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="female"
                                    >
                                        Female
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label
                                        htmlFor="male"
                                    >
                                        Male
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="other"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="other"
                                    >
                                        Other
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="notanswered"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="notanswered"
                                    >
                                        Prefer not to say
                                    </label><br/>
                                </div>
                                <InputError field="gender" messages={messages} />
                                <label className={styles.registerFieldName}>What is your age?</label>
                                <div className={styles.formRadioArea}>
                                    <input
                                        type="radio"
                                        name="age"
                                        value="16oryounger"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="16orless"
                                    >
                                        16 or younger
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="age"
                                        value="17to34"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label
                                        htmlFor="17to34"
                                    >
                                        17-34
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="age"
                                        value="35to49"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="35to49"
                                    >
                                        35-49
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="age"
                                        value="50to69"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="50to69"
                                    >
                                        50-69
                                    </label><br/>
                                    <input
                                        type="radio"
                                        name="age"
                                        value="70plus"
                                        required
                                        className={styles.formRadioButton}
                                        ref={register({ 
                                            required: true,
                                        })}
                                    />
                                    <label 
                                        htmlFor="70plus"
                                    >
                                        70+
                                    </label><br/>
                                </div>
                                <InputError field="age" messages={messages} />
                                <div className={`font-italic ${styles.supporttext}`}>Professional background (non-GLAM)</div>
                                <div className={styles.registerFieldName}>Which of the following applies to you? I am currently...</div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="gallerieslibrariesarchivesmuseums">
                                        <input
                                            className={styles.formCheckbox}
                                            id="gallerieslibrariesarchivesmuseums"
                                            name="background"
                                            type="radio"
                                            value="gallerieslibrariesarchivesmuseums"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Employed in GLAM (Galleries, Libraries, Archives, Museums)
                                        </span>
                                    </label>  
                                </div> 
                                <div className={styles.termwrapper}>
                                    <label htmlFor="educationresearch">
                                        <input
                                            className={styles.formCheckbox}
                                            id="educationresearch"
                                            name="background"
                                            type="radio"
                                            value="educationresearch"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Employed in education and/or research
                                        </span>
                                    </label> 
                                </div> 
                                <div className={styles.termwrapper}>  
                                    <label htmlFor="othersector">
                                        <input
                                            className={styles.formCheckbox}
                                            id="othersector"
                                            name="background"
                                            type="radio"
                                            value="othersector"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Employed in another sector
                                        </span>
                                    </label> 
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="outofwork">
                                        <input
                                            className={styles.formCheckbox}
                                            id="outofwork"
                                            name="background"
                                            type="radio"
                                            value="outofwork"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Out of work
                                        </span>
                                    </label> 
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="homemaker">
                                        <input
                                            className={styles.formCheckbox}
                                            id="homemaker"
                                            name="background"
                                            type="radio"
                                            value="homemaker"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            A homemaker
                                        </span>
                                    </label>  
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="student">
                                        <input
                                            className={styles.formCheckbox}
                                            id="student"
                                            name="background"
                                            type="radio"
                                            value="student"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            A student
                                        </span>
                                    </label>  
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="retired">
                                        <input
                                            className={styles.formCheckbox}
                                            id="retired"
                                            name="background"
                                            type="radio"
                                            value="retired"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Retired
                                        </span>
                                    </label>
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="unabletowork">
                                        <input
                                            className={styles.formCheckbox}
                                            id="unabletowork"
                                            name="background"
                                            type="radio"
                                            value="unabletowork"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                        />
                                        <span>
                                            Unable to work
                                        </span>
                                    </label>
                                </div>
                                <div className={styles.termwrapper}>
                                    <label htmlFor="other">
                                        <input
                                            className={styles.formCheckbox}
                                            id="other"
                                            name="background"
                                            type="radio"
                                            value="other"
                                            ref={register({
                                                required: false,
                                                validate: validateBackground
                                            })}
                                            onChange={e => {
                                                    setOtherChecked(e.target.checked);
                                            }}
                                        />
                                        <span>
                                            Other
                                        </span>
                                    </label>
                                </div>
                                <input 
                                    className={styles.formInput}
                                    id="otherreason"
                                    name="backgroundother"
                                    type="text"
                                    disabled={ !otherChecked }
                                    ref={register({ 
                                        required: false,
                                        minLength: 1,
                                        maxLength: 50,
                                    })}
                                />

                                <div className={`pt-4 ${styles.termwrapper}`}>
                                    <label htmlFor="emailupdates">
                                        <input
                                            className={styles.formCheckbox}
                                            id="emailupdates"
                                            name="emailupdates"
                                            type="checkbox"
                                            ref={register({
                                                required: false
                                            })}
                                        />
                                        <span>
                                             Sign up for email updates
                                        </span>
                                    </label>    
                                </div>

                <input
                    id="signupid"
                    name="signupid"
                    type="hidden"
                    value={signupid}
                    ref={register()}
                />

                <input
                    id="email"
                    name="email"
                    type="hidden"
                    value={email}
                    ref={register()}
                />

                {successfullProfile ?
                    <div className={styles.success}>
                        Your account was succesfully completed. You can now <a href="/login">login</a>
                    </div>
                :
                    <button
                        type="submit"
                        className={styles.submitbutton}
                        disabled={formState.isSubmitting || !formState.isValid || waitingForResponse}
                    >
                        Sign up        
                    </button>
                }

                {errorProfile ?
                    <div className={styles.error}>
                        There was an error processing your data, if this error persists please contact <a href="mailto:support@subtitleathon.eu">support@subtitleathon.eu</a>
                    </div>
                :
                    null
                }

                

            </form>
        </FormProvider>        
    );
}



export default SignUpFormProfile