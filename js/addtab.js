function nth(n){
	switch(n){
	case 1:
		n = 'first';
		return n;
		break;
	case 2:
		n = 'second';
		return n;
		break;
	case 3:
		n = 'third';
		return n;
		break;
	case 4:
		n = 'fourth';
		return n;
		break;
	case 5:
		n = 'fifth';
		return n;
		break;
	}
}

function nn(nt){
	switch(nt){
	case 'first':
		n = 1;
		return n;
		break;
	case 'second':
		n = 2;
		return n;
		break;
	case 'third':
		n = 3;
		return n;
		break;
	case 'fourth':
		n = 4;
		return n;
		break;
	case 'fifth':
		n = 5;
		return n;
		break;
	}
}

function addtab(name, n) {
	nt = nth(n);
	var t = '<a class="item" data-tab="'+nt+'">'+name+'<i class="remove icon"></i></a>'
	var s = '<div class="ui bottom attached tab segment" data-tab="'+nt+'"><div class="ui aligned vertical segment">' +
			    'Chating With ' + name +
			  '</div> <div class="ui aligned vertical segment">	<div class="ui fluid action input"> <input type="text" placeholder="Talking to your friend...">  <div class="ui button">Submit</div> </div> </div> </div>';
	$("#tabs").append(t)
	$("#chating").append(s);
	$('.menu .item')
	  .tab()
	;
	$('#chating').each(function(){
	    var container = jQuery(this);
			//container.find(args.panel).hide();
			container.find(".active").removeClass("active");
			//container.find(args.panel + ":eq(" + args.activate + ")").show();
			container.find("[data-tab='"+nt+"']").addClass("active");      
	});

	$('i.remove').off('click')
	$('i.remove').click(function(){
	  //alert($(this).text());
	  now--;
	  removetab(nn($(this).parent().attr("data-tab")));
	});
}

function removetab(n){
	nt = nth(n);
	$('#chating').find("[data-tab='"+nt+"']").remove();

	$('#chating').each(function(){
	    var container = jQuery(this);
	    	for (var i = n+1; i <= 5; i++) {
	    		container.find("[data-tab='"+nth(i)+"']").attr("data-tab",nth(i-1));
	    	};
			
	  });
}