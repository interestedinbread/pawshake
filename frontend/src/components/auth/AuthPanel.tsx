import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "../common/Button"

export function AuthPanel () {
    const [loggingIn, setLoggingIn] = useState(true)

    return(
        <div>
            {loggingIn ? <LoginForm/> : <RegisterForm/>}
            <p
            className="py-4">
                {loggingIn? 'Not yet signed up?' : 'Already signed up?'}
            </p>
            <Button
            onClick={() => {
                setLoggingIn(prev => !prev)
                }
            }
            variant="primary"
            size="md">
                {loggingIn ? 'Register' : 'Login'}
            </Button>
        </div>
)
}