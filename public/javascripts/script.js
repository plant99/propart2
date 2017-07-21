var $create = $('.create')
var $browse = $('.browse')
var $create_board = $('.create-board')
var $browse_board = $('.browse-board')
var $submit = $('.submit')
var $profiles = $('.profiles')
var $profiles_board = $('.profiles-board')
var invites_container = document.querySelector('.invites_container')
var invites_applied = document.querySelector('.invites_applied')
var invites_created = document.querySelector('.invites_created')
$create.click(function(){
	$create_board.css('display', 'block')
	$browse_board.css('display','none')
	$profiles_board.css('display','none')
})

$browse.click(function(){
	$create_board.css('display', 'none')
	$browse_board.css('display', 'block')
	// load invites after post requests
	$.get('/get_data/', function(response){
		var invites = response.invites ;
		if(invites){
			loadInvites(invites, response.user)
		}
	})
	$profiles_board.css('display','none')
})

$('.profiles').click(function(){
	$create_board.css('display', 'none')
	$browse_board.css('display','none')
	$profiles_board.css('display','block')
	var id = $profiles_board.attr('profile_id') ;
	$.get('/get_data/user_applied_invites/'+id, function(response){
		if(response.success){
			invites_applied.innerHTML = '' ;
			invites_applied.innerHTML = '<h1>INVITES APPLIED</h1>'
			loadAppliedInvites(response.applied_invites,response.user) ;
		}
	})
	$.get('/get_data/user_created_invites/'+id, function(response){
		if(response.success){
			invites_created.innerHTML = '' ;
			invites_created.innerHTML = '<h1>INVITES CREATED</h1>'
			loadCreatedInvites(response.created_invites,response.user) ;
		}
	})
})


//add invite handler

$submit.click(function(){
	var requirements = Number($('.requirements').val()) ;
	console.log(requirements) ;
	if(requirements){
		console.log(typeof(Number($('.requirements').val())),Number($('.requirements').val()))
		$.post('/add_data/invite',{
			category: $('.category').val(),
			title: $('.title').val(),
			description: $('.description').val(),
			requirements:$('.requirements').val()
		}, function(response){
			clearInvitationFields(response)
		})
	}else{
		console.log($('.requirements').val(), typeof($('.requirements').val()))
	}
})
/*
$.post('/add_data/invite',{
		category: $('.category').val(),
		title: $('.title').val(),
		description: $('.description').val(),
		requirements:$('.requirements').val()
	}, function(response){
		clearInvitationFields(response)
	})
*/


// function to clear the fields in add invite form
function clearInvitationFields(response){
	if(response.success === true){
		$('.messageInternal').html('Invite was successfully saved!') ;
	}else{
		$('.messageInternal').html('Invite wasn\'t saved!') ;
	}
	$('.category').val('tech_proj') ;
	$('.title').val('') ;
	$('.description').val('') ;
	$('.requirements').val('') ;
	setTimeout(function(){
		$('.messageInternal').html('')
	}, 3000)
}

//categoryFilter event handlers
var categoryFilter = document.querySelector('.categoryFilter') ;
categoryFilter.onchange = function(){
	$.get('/get_data/'+categoryFilter.value,function(response){
		if(response.success){
			var invites = response.invites ;
			loadInvites(invites, response.user)
		}else{
			invites_container.innerHTML = ''
			var p = document.createElement('p')
			p.innerHTML = 'Oops, no invites come under this category' ;
			p.setAttribute('style','font-size:25px; padding:20px ;')
			invites_container.appendChild(p)
		}
	})
}

function loadInvites(invites, user){
	var countOfInvites = 0 ;
	invites_container.innerHTML = '' ;
	console.log(user) ;
	if(invites.length){
		for(var i=0;i<invites.length;i++){
			if((invites[i].author.name != user.username) && findIndexOf({username: user.username, id:user._id}, invites[i].applicants) && checkIfHidden(invites[i], user)){				countOfInvites++ ;
				var div = document.createElement('div') ;
				div.setAttribute('class','invite') ;
				div.setAttribute('data',invites[i]._id) ;
				var h4 = document.createElement('h4') ;
				h4.innerHTML = invites[i].author.name ;
				var image = document.createElement('img') ;
				var to_remove = document.createElement('div') ;
				var image_for_removing = document.createElement('img') ;
				image_for_removing.src = '/images/delete-icon.png' ;
				image_for_removing.setAttribute('class','image_for_removing') ;
				to_remove.setAttribute('class','to_remove') ;
				to_remove.setAttribute('title','REMOVE INVITE FROM FEED')
				to_remove.appendChild(image_for_removing) ;
				to_remove.onclick = function(e){
					var parent = null ;
					if(e.target.getAttribute('class') == 'to_remove'){
						parent = e.target.parentNode ;
					}else{
						parent = e.target.parentNode.parentNode ;
					}
					$.post('/remove_data/invite_visibility', {
						user:user.username,
						id:parent.getAttribute('data')
					}, function(response){
						if(response.success){
							parent.innerHTML = '<p class="alert">The invite was removed from your feed!</p>'
							setTimeout(function(){
								parent.parentNode.removeChild(parent)
							},5000) ;
						}else{

						}
					})
				}
				var clear_float_for_remove = document.createElement('div') ;
				clear_float_for_remove.setAttribute('class','dummy') ;
				image.src = '/serve_image/' + invites[i].author.image ;
				var detailsContainer = document.createElement('div') ;
				detailsContainer.setAttribute('class','details_container') ;
				var h3 = document.createElement('h3') ;
				h3.innerHTML = invites[i].title ;
				h3.setAttribute('class','invite_header')
				var p = document.createElement('p') ;
				var button = document.createElement('button') ;
				button.setAttribute('data',invites[i]._id) ;
				var required = document.createElement('p') ;
				required.innerHTML = 'Number of partners required: ' + invites[i].requirements ;
				required.setAttribute('class','required')
				button.innerHTML = 'Apply' ;
				p.innerHTML = invites[i].description ;
				detailsContainer.appendChild(h3) ;
				detailsContainer.appendChild(p) ;
				detailsContainer.appendChild(required) ;
				div.appendChild(image)
				div.appendChild(h4) ;
				div.appendChild(to_remove) ;
				div.appendChild(clear_float_for_remove) ;
				div.appendChild(detailsContainer) ;
				div.appendChild(button)
				invites_container.appendChild(div) ;
				//set button onclick
				button.onclick = function(e){
					$.post('/add_data/request_for_invite',{id: e.target.getAttribute('data')}, function(response){
						if(response.success){
							var p = document.createElement('p') ;
							p.innerHTML = 'successfully applied to invite' ;
							p.setAttribute('style','font-size:25px; padding:20px;')
							var parentElement = e.target.parentNode ;
							parentElement.innerHTML = '' ;
							parentElement.appendChild(p) ;
							setTimeout(function(){
								document.querySelector('.invites_container').removeChild(parentElement) ;
							}, 3000)
							if($('.invites_container').html() === ''){
								alert('chutiya')
							}
						}else{
							var p = document.createElement('p') ;
							p.innerHTML = 'Application was unsuccessful, please try again.' ;
							p.setAttribute('style','font-size:25px; padding:20px; color: grey;') ;
							var parentElement = e.target.parentNode ;
							parentElement.insertBefore(p, parentElement.firstChild) ;
							setTimeout(function(){
								parentElement.removeChild(p) ;
							}, 3000)
						}
					})
				}
			}
		}
		if(!countOfInvites){
			var p =document.createElement('p') ;
			p.innerHTML = "Oops, you have applied all of the available Invites."
			invites_container.appendChild(p)
			p.setAttribute('style','font-size:25px; padding:20px ;')
		}
	}else{
		var p =document.createElement('p') ;
		p.innerHTML = "Oops, no invites are active."
		invites_container.appendChild(p)
		p.setAttribute('style','font-size:25px; padding:20px ;')
	}
}

function findIndexOf(object, array){
	for(var i=0 ;i<array.length ;i++){
		if((object.username === array[i].username) && (object.id === array[i].id)){
			return false ;
		}
	}
	return true ;
}

function loadAppliedInvites(invites, user){
	if(invites.length){
		for(var i=0;i< invites.length;i++){
			var inviteApplied = document.createElement('div') ;
			inviteApplied.setAttribute('id_invite',invites[i]._id) ;
			inviteApplied.setAttribute('class','inviteApplied') ;
			var titleName = document.createElement('p') ;
			titleName.innerHTML = "' "+invites[i].title +" '"+ ' by <br>'
			var link_to_profile = document.createElement('a') ;
			link_to_profile.setAttribute('class','link_to_profile')
			var href = '/'+invites[i].author.name ;
			link_to_profile.setAttribute('href', href)
			link_to_profile.setAttribute('target', '_blank') ;
			link_to_profile.innerHTML = invites[i].author.name+' ' ;
			var profile_photo = document.createElement('img') ;
			profile_photo.src = '/serve_image/'+invites[i].author.image ;
			link_to_profile.appendChild(profile_photo)
			titleName.appendChild(link_to_profile) ;
			inviteApplied.appendChild(titleName) ;
			var status = document.createElement('p') ;
			status.setAttribute('class','status_of_user') ;
			status.innerHTML = 'STATUS' ;
			var message = document.createElement('p') ;
			//to check the status and message in the invites[i].applicants, check username then status ok?
			//IMPORTANT
			var applicants = invites[i].applicants ;
			for(var j=0 ;j< applicants.length; j++){
				if(applicants[j].id == user._id){
					var color = applicants[j].status.color ;
					if(color === 'red'){
						status.style.backgroundColor = '#d8401a'
						status.style.color = '#f4fcf2' ;
						status.innerHTML = 'REJECTED' ;
					}else if(color === 'green'){
						status.style.backgroundColor = '#1ad849' ;
						status.style.color = '#f4fcf2' ;
						status.innerHTML = 'SELECTED' ;
					}else{
						status.style.backgroundColor = '#e7f47f' ;
						status.style.color = '#ea4f5a' ;
						status.innerHTML = 'WAIT' ;
					}
					//status.style.backgroundColor = applicants[j].status.color ;
					message.innerHTML = applicants[j].status.message ;
					inviteApplied.appendChild(status) ;
					inviteApplied.appendChild(message) ;
					break ;
				}else{
					console.log(applicants[j])
				}
			}
			invites_applied.appendChild(inviteApplied) ;
		}
	}else{
		var p = document.createElement('p');
		p.innerHTML = "Opps, you didn't apply to any invite yet!" ;
		invites_applied.appendChild(p)
	}
}

function loadCreatedInvites(invites, user){
	if(invites.length){
		for(var i=0;i< invites.length;i++){
			var inviteCreated = document.createElement('div') ;
			inviteCreated.setAttribute('class','inviteCreated') ;
			inviteCreated.setAttribute('invite_id',invites[i]._id)
			var title = document.createElement('h2') ;
			title.innerHTML = invites[i].title ;
			var remove_option = document.createElement('span') ;
			remove_option.innerHTML = 'REMOVE INVITE' ;
			remove_option.setAttribute('class','remove') ;
			inviteCreated.appendChild(title)
			inviteCreated.appendChild(remove_option) ;
			var applicants = invites[i].applicants ;
			console.log(applicants)
			var applicant_counter_for_single_invite = 0 ;
			if(applicants.length){
				var h3 = document.createElement('h3') ;
				h3.innerHTML = 'Pending application' ;
				inviteCreated.appendChild(h3) ;
				applicant_counter_for_single_invite = 0 ;
				for(var j=0 ;j< applicants.length ;j++){
					if(applicants[j].status.color == 'yellow'){
						applicant_counter_for_single_invite++ ;
						var applicant = document.createElement('div') ;
						applicant.setAttribute('class','applicant') ;
						var name_of_applicant = document.createElement('a') ;
						name_of_applicant.setAttribute('class', 'name_of_applicant')
						name_of_applicant.href = '/'+applicants[j].id ;
						name_of_applicant.innerHTML = applicants[j].username ;
						name_of_applicant.setAttribute('target', '_blank') ;
						var add_applicant = document.createElement('span') ;
						add_applicant.innerHTML = '<img src="/images/glyphicons/png/glyphicons-199-ok-circle.png">'
						add_applicant.setAttribute('class', 'add_applicant') ;
						add_applicant.setAttribute('invite_id',invites[i]._id)
						add_applicant.setAttribute('user_id',applicants[j].username)
						add_applicant.setAttribute('dumy','check_grammar') ;
						var remove_applicant = document.createElement('span') ;
						remove_applicant.innerHTML = '<img src="/images/glyphicons/png/glyphicons-198-remove-circle.png">'
						remove_applicant.setAttribute('class', 'remove_applicant')
						remove_applicant.setAttribute('invite_id',invites[i]._id)
						remove_applicant.setAttribute('user_id',applicants[j].username)
						remove_applicant.setAttribute('dumy','check_grammar')
						applicant.appendChild(name_of_applicant) ;
						//applicant.appendChild(image_of_applicant) ;
						applicant.appendChild(remove_applicant) ;
						applicant.appendChild(add_applicant) ;
						inviteCreated.appendChild(applicant) ;

						var dummy = document.createElement('dummy') ;
						dummy.setAttribute('class', 'dummy1') ;
						dummy.innerHTML = '.'
						inviteCreated.appendChild(dummy)
					}
				}
				if(!applicant_counter_for_single_invite){
					var p = document.createElement('p') ;
					p.innerHTML = 'This invite doesn\'t have any pending applications pending!!'
					inviteCreated.appendChild(p)
				}else{

				}
				applicant_counter_for_single_invite = 0;
				var h3 = document.createElement('h3') ;
				h3.setAttribute('class','approved_invitations_header') ;
				h3.innerHTML = 'Approved applications' ;
				inviteCreated.appendChild(h3) ;
				for(var j=0;j< applicants.length; j++){
					if(applicants[j].status.color == 'green'){
						var a = document.createElement('a') ;
						a.innerHTML = applicants[j].username ;
						a.setAttribute('href', '/'+applicants[j].id) ;
						a.setAttribute('class', 'approved_user_link') ;
						a.setAttribute('target','_blank')
						inviteCreated.appendChild(a) ;
						applicant_counter_for_single_invite++ ;
					}
				}
				if(!applicant_counter_for_single_invite){
					var p = document.createElement('p') ;
					p.innerHTML = 'This invite doesn\'t have any approved applications pending!!'
					inviteCreated.appendChild(p)
				}else{

				}
			}else{
				var p = document.createElement('p') ;
				p.innerHTML = 'This invite doesn\'t have any applications!!'
				inviteCreated.appendChild(p)
			}
			if(i!= invites.length-1){
				inviteCreated.innerHTML+= '<hr>'
			}
			invites_created.appendChild(inviteCreated);
			if(i === invites.length-1){
				// add event handler for remove invite

				var remove_options = document.querySelectorAll('.remove') ;
				if(remove_options.length){
					for(var i=0;i< remove_options.length;i++){
						var remove_option = remove_options[i] ;
						remove_option.onclick = function(e){
							var confirm_delete = window.confirm('Are you sure you want to delete the invite "'+e.target.previousSibling.innerHTML+'" ?') ;
							if(confirm_delete){
								$.post('/remove_data/invite',{id: e.target.parentNode.getAttribute('invite_id')}, function(response){
									console.log(response) ;
								})
							}else{
								// if not
							}
						}
					}
				}
			}
		}
	}else{
		//load headers
	}
	// add_applicant event listners
	var list = document.querySelectorAll('.add_applicant') ;
	for(var i=0;i<list.length;i++ ){
		list[i].onclick = function(e){
			console.log('Hope event handler is running') ;
			console.log(e.target);
			var parent ;
			if(e.target.getAttribute('class') === 'add_applicant'){
				parent = e.target ;
			}else{
				parent = e.target.parentNode ;
			}
			$.post('/add_data/accept_invite',{
				userId:parent.getAttribute('user_id') ,
				inviteId:parent.getAttribute('invite_id')
			}, function(response){
				var status_of_response = response.success ;
				var new_parent = parent.parentNode ;
				var p = document.createElement('p')
				if(status_of_response){
					new_parent.innerHTML = '' ;
					p.innerHTML = 'User has been approved for the invite!'
					new_parent.appendChild(p) ;
					//auto update
					var parent_of_new_parent = new_parent.parentNode ;
					var a = document.createElement('a') ;
					a.setAttribute('class','approved_user_link') ;
					a.href = '/'+ parent.getAttribute('user_id') ;
					a.innerHTML = parent.getAttribute('user_id') ;
					var approved_header = findApprovedHeader(parent_of_new_parent) ;
					if(approved_header.nextSibling.innerHTML == 'This invite doesn\'t have any approved applications pending!!'){
						approved_header.nextSibling.innerHTML = '' ;
						approved_header.appendChild(a) ;
					}else{
						approved_header.appendChild(a) ;
						console.log(approved_header.nextSibling.innerHTML) ;
					}
					console.log(parent_of_new_parent) ;
				}else{
					console.log(status_of_response, 'behenchod')
					p.innerHTML = 'Sorry, there was a trouble! Try again.' ;
					new_parent.appendChild(p) ;
					setTimeout(function(){
						new_parent.removeChild(p) ;
					}, 4000)
				}
			})
		}
	}

	list = document.querySelectorAll('.remove_applicant') ;
	for(var i=0;i< list.length; i++){
		list[i].onclick = function(e){
			console.log(e.target);
			var parent ;
			if(e.target.getAttribute('class') === 'remove_applicant'){
				parent = e.target ;
			}else{
				parent = e.target.parentNode ;
			}
			$.post('/add_data/reject_invite',{
				userId:parent.getAttribute('user_id') ,
				inviteId:parent.getAttribute('invite_id')
			}, function(response){
				var status_of_response = response.success ;
				var new_parent = parent.parentNode ;
				var p = document.createElement('p')
				if(status_of_response){
					new_parent.innerHTML = '' ;
					p.innerHTML = 'User was rejected from the invite!'
					new_parent.appendChild(p) ;
				}else{
					console.log(status_of_response, 'behenchod')
					p.innerHTML = 'Sorry, there was a trouble! Try again.' ;
					new_parent.appendChild(p) ;
					setTimeout(function(){
						new_parent.removeChild(p) ;
					}, 4000)
				}
			})
		}
	}
}


// Live username search
var usernames_container = document.getElementById('usernames_container') ;

var username_for_search = document.getElementById('username_for_search') ;
username_for_search.onkeyup = function(){
	var username = username_for_search.value ;
	$.get('/get_data/suggest_usernames/'+username,function(response){
		if(response.success){
			var usernames = response.usernames ;
			usernames_container.innerHTML = '' ;
			for(username of usernames){
				var a = document.createElement('a') ;
				var p = document.createElement('p') ;
				a.setAttribute('class', 'username_suggestion') ;
				a.setAttribute('href','/'+username) ;
				a.setAttribute('target','_blank') ;
				p.innerHTML = username ;
				a.appendChild(p) ;
				usernames_container.appendChild(a) ;
				a.onclick = function(){
					 usernames_container.innerHTML = '' ;
				}
			}

		}else{

		}
	})
}

//search button
$('.search_users').click(function(){
	window.open('/'+$('#username_for_search').val(),'_blank') ;
	$('#usernames_container').html('') ;
})

function findApprovedHeader(parent){
	var childNodes = parent.childNodes ;
	for(var i=0;i<childNodes.length;i++){
		if(childNodes[i].getAttribute('class') === 'approved_invitations_header'){
			return childNodes[i] ;
		}
	}
	return null;
}
window.onclick = function(e){
	var target = e.target ;
	var username_for_search = document.getElementById('username_for_search') ;
	var search_button = document.querySelector('.search_users') ;
	var usernames_container = document.getElementById('usernames_container') ;
	if(target === username_for_search || target === search_button || target === usernames_container){
		//do as usual
	}else{
		usernames_container.innerHTML = '' ;
	}
}
function checkIfHidden(invite, user){
	console.log(invite._id, user.hidden_invites) ;
	 if(user.hidden_invites.indexOf(invite._id) == (-1)){
		 console.log(true)
		 return true ;
	 }
	 else{
		 console.log(false) ;
		 return false ;
	 }
}
