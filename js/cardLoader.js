var supported = false, validFile = false, validHash = false;
var uid = null, hashedPK = null, pk = null;

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
	var arrBuf = new ArrayBuffer(32+pw.length), intArr = new Uint8Array(arrBuf), i = 0;
	for( ; i < 32 ; i++)
		intArr[i] = parseInt(uid.substr(i<<1,2),16);
	for( ; i < intArr.length ; i++)
		intArr[i] = pw.charCodeAt(i-32);
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
		console.log('pk: '+pk);
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
	//http request localhost/getSK?uid={uid}&pk={pk}
	//if got SK != "" and SK != null, then login successful else login fail
}

function login(){
	if(!supported)
		return alert('Your browser is not supported! Kindly use a modern browser!');
	else if(!validFile)
		return alert('You have not selected a valid card file!');
	getHash(document.getElementById('pwd').value,getSK);
	return false;
}
