
//username validation
function validateUsernameInput() {
    const usernameInput = document.getElementById('name');
    const usernameWarning = document.getElementById('nameWarning');

    usernameInput.addEventListener('input', () => {
        const usernameValue = usernameInput.value;
        if (usernameValue === '') {
            usernameWarning.innerHTML = "Username cannot be empty.";
            usernameWarning.style.color = "red";
        } else if (/\s/.test(usernameValue)) {
            usernameWarning.innerHTML = "Username cannot contain spaces.";
            usernameWarning.style.color = "red";
        }
        else if (usernameValue.length<6) {
            usernameWarning.innerHTML = "Username too short";
            usernameWarning.style.color = "red";
        } else if (!/^[a-zA-Z0-9_.]+$/.test(usernameValue)) {
            usernameWarning.innerHTML = "Username can only contain letters, numbers,  dots \".\" and underscores \"_\"  .";
            usernameWarning.style.color = "red";
        } else {
            usernameWarning.innerHTML = "Valid username.";
            usernameWarning.style.color = "green";
        }
    });
}







//validate email
function validateEmailFormat() 
{
    const emailInput = document.getElementById('email');
    const emailWarning = document.getElementById('emailWarning');

    emailInput.addEventListener('input', () =>
     {
        const emailValue = emailInput.value.trim(); 
        if (emailValue === '') 
        {
            emailWarning.innerHTML = "Email address cannot be empty.";
            emailWarning.style.color = "red";
        }  
        else 
        {
            emailWarning.innerHTML = "";
            emailWarning.style.color = "green";
        }
    });
}










//validate password
function validatepassword() {
    const password = document.getElementById('password');
    const passwordWarning = document.getElementById('passwordWarning');

    password.addEventListener('input', () => {
        const passwordValue = password.value;
        if (passwordValue === '') {
            passwordWarning.innerHTML = "Password cannot be empty.";
            passwordWarning.style.color = "red";
            return; 
        }

        let errors = [];

        if (passwordValue.length < 8) {
            errors.push("Password must be at least 8 characters long.");
        }

        if (!/[A-Z]/.test(passwordValue)) {
            errors.push("Password must contain at least one uppercase letter.");
        }

        if (!/[a-z]/.test(passwordValue)) {
            errors.push("Password must contain at least one lowercase letter.");
        }

        if (!/\d/.test(passwordValue)) {
            errors.push("Password must contain at least one number.");
        }

        if (errors.length > 0) {
            passwordWarning.innerHTML = errors.join("<br>");
            passwordWarning.style.color = "red";
        } else {
            passwordWarning.innerHTML = "Valid password.";
            passwordWarning.style.color = "green";
        }
    });
}



//validate confirm password 
function validatePasswordMatch() {
    const password = document.getElementById('password');
    const Cpassword = document.getElementById('Cpassword');
    const CpasswordWarning = document.getElementById('CpasswordWarning');

    Cpassword.addEventListener('input', () => {
        const passwordValue = password.value ;
        const CpasswordValue = Cpassword.value;
        if (CpasswordValue === '') {
            CpasswordWarning.innerHTML = "Please confirm your password.";
            CpasswordWarning.style.color = "red";
        } else if (passwordValue !== CpasswordValue) {
            CpasswordWarning.innerHTML = "Passwords do not match.";
            CpasswordWarning.style.color = "red";
        } else {
            CpasswordWarning.innerHTML = "Passwords match.";
            CpasswordWarning.style.color = "green";
        }
    });
}


//validate phone number
function validateNumberInput() {
    const phoneNumberInput = document.getElementById('number');
    const phoneNumberWarning = document.getElementById('numberWarning');

    phoneNumberInput.addEventListener('input', () => {
        const phoneNumberValue = phoneNumberInput.value.trim(); // Trim whitespace from input value

        if (phoneNumberValue === '') {
            phoneNumberWarning.innerHTML = "Phone number cannot be empty.";
            phoneNumberWarning.style.color = "red";
        } else if (!/^[2459]\d{7}$/.test(phoneNumberValue)) {
            phoneNumberWarning.innerHTML = "Invalid phone number";
            phoneNumberWarning.style.color = "red";
        } else {
            phoneNumberWarning.innerHTML = "Valid phone number.";
            phoneNumberWarning.style.color = "green";
        }
    });
}




// Initializing 
validateUsernameInput();
validatepassword();
validatePasswordMatch();
validateNumberInput();
validateEmailFormat();
