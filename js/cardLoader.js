var supported = false, validFile = false, validHash = false;
var uid = null, hashedPK = null, pk = null, uidArr = null;

if(window.File && window.FileReader && window.FileList && window.Blob && window.crypto && window.crypto.subtle)
	supported = true;
else alert("Unsupported Browser!");

window.onload = function(){
	document.getElementById('cardFile').onchange = fileSelectHandler;
	document.getElementById('loginForm').onsubmit = login;
}

function fileloaded(evt){
	validFile = false;
	var data = evt.target.result.split('\n',2);
	if(data.length < 2 || data[0].length != 64 || data[1].length != 32 || data[0].search(/^[0-9a-fA-F]+$/) == -1 || data[1].search(/^[0-9a-fA-F]+$/) == -1){
		document.getElementById('cardFile').value = "";
		return alert("Invalid Card File Selected!");
	}
	uid = data[0];
	hashedPK = data[1];
	validFile = true;
}

function fileSelectHandler(evt){
	validFile = false;
	var file = evt.target.files[0];
	if(!file){
		file.value = "";
		return;
	}
	var reader = new FileReader();
	reader.onload = fileloaded;
	reader.readAsText(file);
}

function getHash(pw,cb){
	validHash = false;
	if(!supported || !validFile || uid.length != 64 || hashedPK.length != 32)
		cb(null);
	var arrBuf = new ArrayBuffer(32+pw.length), i = 0;
	uidArr = new Uint8Array(arrBuf);
	for( ; i < 32 ; i++)
		uidArr[i] = parseInt(uid.substr(i<<1,2),16);
	for( ; i < uidArr.length ; i++)
		uidArr[i] = pw.charCodeAt(i-32);
	crypto.subtle.digest('SHA-256',arrBuf).then(function(hash){
		if(hash.byteLength != 32)	//sha-256 have 32B result
			return cb(null);
		var pkBuf = new ArrayBuffer(16), pkArr = new Uint8Array(pkBuf), pkWordArr = new Uint32Array(pkBuf);
		for(var i = 0 ; i < pkArr.length ; i++)
			pkArr[i] = parseInt(hashedPK.substr(i<<1,2),16);
		var hashBuf = hash.slice(0,16), hashArr = new Uint8Array(hashBuf), hashWordArr = new Uint32Array(hashBuf);
		for(var i = 0 ; i < pkWordArr.length ; i++)
			pkWordArr[i] ^= hashWordArr[i];
		pk = "";
		for(var i = 0 ; i < pkArr.length ; i++)
			pk +=  ('0'+pkArr[i].toString(16)).slice(-2);
		validHash = true;
		cb(pk);
	},function(err){
		console.log('Hash failed, reason: '+err);
		cb(null);
	});
}

function getSK(result){
	if(result == null || !validHash || result.length != 32){
		alert('Invalid card/password! Try again!');
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.onload = function(evt){
		if(this.status == 200){	//success
			var sk = "", skBuf = new ArrayBuffer(32), skArr = new Uint8Array(skBuf);
			try{
				sk = window.atob(this.response);//base64 to ascii
				if(sk.length != 32)
					throw new Error("Invalid Base64 data!");
			}catch(err){
				alert("Unexpected response received!\n"+this.response);
				return;
			}
			for(var i = 0 ; i < sk.length ; i++)
				skArr[i] = sk.charCodeAt(i);
			crypto.subtle.digest('SHA-256',skBuf).then(function(hash){
				if(hash.byteLength != 32)	//sha-256 have 32B result
					return;
				var packBuf = new ArrayBuffer(64), token = new Uint8Array(packBuf), hArr = new Uint8Array(hash), i = 0;
				for( ; i < 32 ; i++)
					token[i] = uidArr[i];
				for( ; i < 64 ; i++)
					token[i] = hArr[i-32];
				submitToken(token);
			},function(err){
				console.log('Hash failed, reason: '+err);
				cb(null);
			});
		}else if(this.status == 401)
			alert("Invalid Private Key is provided! Details:\n"+this.response);
		else if(this.status == 400)
			alert("Invalid data is provided! Details:\n"+this.response);
		else alert("Unknown Error has occured, response:\n"+this.response);
	}
	xhr.onerror = function(evt){
		alert("Error: "+evt);
		console.log(evt);
	}
	xhr.open('GET','http://localhost:8000/getkey?userid='+uid+'&privatekey='+pk,true);
	console.log('Sending request: '+'http://localhost:8000/getkey?userid='+uid+'&privatekey='+pk);
	xhr.send();
}

function submitToken(token){
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
	}
	xhr.open('POST','/login',true);
	xhr.send(token);
	console.log(token);
}

function login(){
	if(!supported)
		return alert('Your browser is not supported! Kindly use a modern browser!');
	else if(!validFile)
		return alert('You have not selected a valid card file!');
	getHash(document.getElementById('pwd').value,getSK);
	return false;
}
