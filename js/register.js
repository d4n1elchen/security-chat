function submitRegister(info){
	if(!info.email.value.match(/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b$/)){
		alert('Invalid e-mail format!');
		return false;
	}
	if(info.user.value.length < 4 || info.user.value.length > 10){
		alert('Username must have between 4 to 10 characters!');
		return false;
	}
	if(!info.user.value.match(/^\w+$/)){
		alert('Username may only contain a-z, A-Z, 0-9, _ only!');
		return false;
	}
	if(info.pwd.value != info.pwd_cf.value){
		alert('Passwords are not same!');
		return false;
	}
	return confirm('Welcome to SCS!');
}