
	    //initializing
		var BoxButtonSubmitId		=	'drwebConfirmationSubmit';
		var BoxButtonCloseId		= 	'drwebConfirmationClose';
		var BoxLeftColumnId			= 	'drwebConfirmationLeftColumn';
		var BoxRightColumnId		=	'drwebConfirmationRightColumn';
		var BoxId					= 	'drwebConfirmation';
		var BoxFormId				= 	'drwebConfirmationForm';
		var LinkAttribute			=	'drweb_check_status';
		var InfectionNameAttribute 	=	'drweb_check_infection_name';
		var BoxDrWebDescriptionLink	= 	'drweb_description_link';
		var BoxDrWebDescription		= 	'drweb_description';
		var BoxTimeLabel			= 	0;
		var LinksStatus = {};
		var Options = {};
		var Hostname = document.location.hostname;

		var ads_enabled = false;
		var analytics_enabled = false;
		var social_enabled = false;
		var track_enabled = false;
        var flash_enabled = false;
        var infoString = "";
        var block_mode = false;
        var manualHidingMode = false;
        var baseURL = "";
        var actualURL = "";
        var blockedItems = "";

        var blocks = new Array();
        var socialPatterns = null;
		var adsPatterns = null;
        var specSocialBlocks = null;
        var adsException = null;
        var flashException = null;

        //clear refresh state
        localStorage["refreshsocial-vk"] = false;
        localStorage["refreshsocial-gl"] = false;
        localStorage["refreshsocial-fb"] = false;

		//check href parameter
		var LinkFunction = function(link)
		{
			if(link)
			{
				link = link.replace(/\s+/, '');
				//php url link checking
				var result = this.linkRegexp.exec(link);
				if(result)
				{
				    //decoding url
					var url = DecodeURIComponentFix(result[1]);
					if(this.extLinkRegexp.test(url))
						return url;
				}
				else
				{
				    //href link checking
					result = this.extLinkRegexp.exec(link);
					if(result)
						return result[1];
				}
			}
			return false;
		}

	    //google+ link checking
		var GoogleLinkFunction = function(link)
		{
			if(link)
			{
				if(this.hostname == 'm.google.com')
				{
				    //decoding url
					link = DecodeURIComponentFix(link);
					link = link.replace(/\\\//ig, "/");
				}
				link = link.replace(/\s+/, '');
				var result = this.linkRegexp.exec(link);
				if(result)
				{
					return result[1];
				}
			}
			return false;
		}

        //find clicked element link
		var FindElement = function(el, eventObj)
		{
			while(el.parentNode && el.parentNode.nodeName.toUpperCase() != 'BODY')
			{
				if(el.nodeName.toUpperCase() == 'A') { 
					if(el.getAttribute('class') == 'video' && Sites[Hostname].name == 'vkontakte') {
						break;
					}
					if(eventObj.type == 'click') {
						return this.linkFunction(el.href);
					}
				}
				el = el.parentNode;
			}
			return false;	
		}

		//find google+ clicked element link
		var GoogleFindElement = function(el, eventObj)
		{
			while(el.parentNode && el.parentNode.nodeName.toUpperCase() != 'BODY')
			{
				switch(el.nodeName.toUpperCase())
				{
					case 'A':
						if(eventObj.type == 'click')
						{
							return this.linkFunction(el.href);
						}
						break;
						
					case 'DIV':
						if(el.getAttribute('data-content-url') && el.getAttribute('data-content-type') != 'application/x-shockwave-flash')
							return this.linkFunction(el.getAttribute('data-content-url'));
						break;
				
				}
				el = el.parentNode;
			}
			
			return false;
		}

		// sites settings
		var Sites = 
		{
			'vkontakte.ru' :
			{
				'name' : 'vkontakte', 
				'linkRegexp' : /.*\/away\.php\?to=([^&]+)/i,
				'extLinkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?(?:vkontakte.ru|vk.com|vk.me)(?:\/|$))[^\s]+)/i,
				'linkFunction' : LinkFunction,
				'findElement'  : FindElement
			},
			'facebook.com' :
			{
				'name' : 'facebook', 
				'linkRegexp' : /^.*?\/(?:(?:l\.php\?u=)|(?:uiserver.php?.*?redirect_uri=))([^&]+)/i,
				'extLinkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?(?:facebook.com|fb.com|instagram.com)(?:\/|$))[^\s]+)/i,
				'linkFunction' : LinkFunction,
				'findElement'  : FindElement,
				'hostname'		: 'plus.google.com'
			},
			'plus.google.com' :
			{
				'name' : 'google',
				'linkRegexp' : /^((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?google\.(?:ru|com)(?:\/|$)).+)/i,
				'linkFunction' : GoogleLinkFunction,
				'findElement'  : GoogleFindElement
			},
			'm.google.com' :
			{
				'name' : 'google',
				'linkRegexp' 	: /^(?:http:\/\/)?javascript:_window\('((?:https?:\/\/|ftp:\/\/)(?!(?:.+\.)?google\.(?:ru|com)(?:\/|$)).+)'\)/i,
				'linkFunction'	: GoogleLinkFunction,
				'findElement'	: GoogleFindElement,
				'hostname'		: 'm.google.com'
			}
		}
	
		Sites['vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['m.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['0.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['t.vk.com'] 			= 	Sites['vkontakte.ru'];
		Sites['m.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['0.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['t.vkontakte.ru'] 	= 	Sites['vkontakte.ru'];
		Sites['fb.com'] 			= 	Sites['facebook.com'];
		Sites['www.fb.com']			= 	Sites['facebook.com'];
		Sites['www.facebook.com'] 	= 	Sites['facebook.com'];
		Sites['m.facebook.com'] 	= 	Sites['facebook.com'];	
		Sites['0.facebook.com'] 	= 	Sites['facebook.com'];
		Sites['instagram.com'] 		= 	Sites['facebook.com'];
		

		var LinkInTextRegexp = /(https?:\/\/|ftp:\/\/)?(?:_*?)((?:[a-z0-9-.]+|[Ð°-Ñ0-9-.]+)\.(?:museum|aero|biz|coop|info|name|com|edu|int|net|org|ru|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mil|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw|Ñ€Ñ„|xn--[^\/]+)(?:\/[^\s]+|\/?))/i;
		
		var LinkHrefRegexp = 
		/^(https?:\/\/|ftp:\/\/)?(.+\.[^\.\/]+(?:\/.+$|\/$|$))/i;

		//check settings
		HandleGetOptions = function(message)
		{
		    callbackFunction(message);
            var update = message.update;
            if(typeof Sites[Hostname] != "undefined")
            {
                // update options
                if(!update || (update && Options[Sites[Hostname].name+'-check'] != message.options[Sites[Hostname].name+'-check']))
                {
                    Options = message.options;
                    Run(update);
                }
            }
		}

		//add
		Run = function(update)
		{
			if(!update)
			{
				//window.addEventListener('focus', function() { chrome.extension.sendMessage({'action' : 'GetOptions'}, HandleGetOptions); }, false);
				
				window.document.addEventListener('keydown', 
					function(eventObj) 
					{
						if (eventObj.keyCode == '27' && typeof Box != "undefined" && Box) 
						{
							Box.parentNode.removeChild(Box);
							Box = null;
						}
					}
				, false);
			}
			if(Options[Sites[Hostname].name+'-check'])
			{
				window.document.addEventListener('click', HandleClick, true);
				window.document.addEventListener('mouseup', HandleClick, true);
			}
			else
			{
				window.document.removeEventListener('click', HandleClick, true);
				window.document.removeEventListener('mouseup', HandleClick, true);
			}
		}

		//after checking ling response
		HandleDrWebCheckUrl = function(message)
		{
			var dp = new window.DOMParser();
			var xmlDoc = dp.parseFromString(message.response, "text/xml");
			var status = xmlDoc.getElementsByTagName("status")[0].textContent;
			var dwreport = xmlDoc.getElementsByTagName('dwreport')[0].textContent.split('with')[1];
			var unreliability = xmlDoc.getElementsByTagName('pcontrol')[0]? true : false;
			status = (status != "infected" && unreliability)? 'unreliability' : status;
			if(status == "clean" || status == "infected" || status == "unreliability")
			{
				LinksStatus[message.url] = 
				{
					'status'  : status,
					'dwreport' : dwreport,
					'url' : message.url
				}
			}
			SetStatusForDialog({ 'status'  : status, 'dwreport' : dwreport,'url' : message.url, 'timelabel' : message.timelabel });
			return true;
		}

		//create dialog box appearance which depends on response data
		SetStatusForDialog = function(link)
		{
			if(window.document.getElementById(BoxId) && link.timelabel == BoxTimeLabel)
			{
				var leftColumn = window.document.getElementById(BoxLeftColumnId);
				var button = window.document.getElementById(BoxButtonSubmitId);
				var content = window.document.getElementById(BoxRightColumnId);
				
				if (button)
					button.innerHTML = chrome.i18n.getMessage('leaveWebsite');
					
				switch(link.status) 
				{
					case 'serverUnavailable':
					case 'error':
						if (button)
							button.removeAttribute('disabled');
						content.innerHTML = chrome.i18n.getMessage('scanTimeout');
						leftColumn.className = 'drwebErrorLink';
					break;
					case 'clean':
						if (button) 
						{
							button.removeAttribute('disabled');
							button.focus();
						}
						leftColumn.className = 'drwebOkLink';
					break;
					case 'unknown':
						leftColumn.className = 'drwebErrorLink';
					break;
					case 'error':
						content.innerHTML = chrome.i18n.getMessage('scanError');

						leftColumn.className = 'drwebErrorLink';
					break;
					case 'infected':
					    button.style.display = "none";
						var infectionName = link.dwreport;
						var infectionText = chrome.i18n.getMessage('infectionText');
						infectionText = infectionText.replace('drwebLinkName', link.url);
						infectionText = infectionText.replace('drwebLinkDesc', infectionName);
						content.innerHTML = infectionText;
						leftColumn.className = 'drwebThreatLink';
					break;
					case 'suspicious':
						leftColumn.className = 'drwebErrorLink';
					break;
					case 'unreliability':
						content.innerHTML = chrome.i18n.getMessage('siteUnreliabilityMessage').replace('drwebLinkName', link.url);
						leftColumn.className = 'drwebThreatLink';
					break;
					case 'progress':
					break;
				}
			}
		}

        // click link handle
		HandleClick = function(eventObj)
		{
		    //check if event is clicking by left or middle mouse button
			if(eventObj.which != 1 && eventObj.which != 2)
				return false;
		    //getting clicked element
			var el = eventObj.target;
			//get link if this exist
			if(result = Sites[Hostname].findElement(el, eventObj))
			{
				var url = result;
				BoxTimeLabel = new Date().getTime();
				//create dialog box
				Dialog(url);

				//checking if this first time to check external link
				if(typeof LinksStatus[url] == "undefined")
				{
					el.removeAttribute('onmousedown');
					CheckLink(url);
				}
				else
				{
					SetStatusForDialog({ 'status'  : LinksStatus[url].status, 'dwreport' : LinksStatus[url].dwreport, 'url' : url, 'timelabel' : BoxTimeLabel });
				}
				eventObj.preventDefault();
				eventObj.stopPropagation();
			}
			return false;
		}

		HandleLinkClick = function(eventObj)
        {
             if (manualHidingMode)
             {
                 if (eventObj.target.id != "saveBlocksButton" && eventObj.target.id != "cancelAddBlocksButton")
                 {
                     //check if event is clicking by left or middle mouse button
                     if(eventObj.which != 1 && eventObj.which != 2)
                        return false;

                     if (eventObj.target.tagName == "A" || eventObj.target.parentNode.tagName == "A"){
                         eventObj.preventDefault();
                         eventObj.stopPropagation();
                     }
                 }
             }
        }

		// click link handle
        HandleAdsClick = function(eventObj)
        {
            if (eventObj.target.id != "saveBlocksButton" && eventObj.target.id != "cancelAddBlocksButton")
            {
                //check if event is clicking by left or middle mouse button
                if(eventObj.which != 1 && eventObj.which != 2)
                    return false;
                var el = eventObj.target;
                if (manualHidingMode){
                    eventObj.preventDefault();
                    eventObj.stopPropagation();
                }
            }
        }

		//send request for checking link to DrWebCheckUrl [background.js]
		CheckLink = function(url)
		{
		    try{
			    chrome.extension.sendMessage({ 'action' : 'DrWebCheckUrl', 'url' : url, 'sitename' : Sites[Hostname].name, 'timelabel' : BoxTimeLabel }, HandleDrWebCheckUrl);
			}
			catch(err){}
		}

		//creating dialog for external links
		Dialog = function(url) 
		{
		    //getting dialog box and trying to remove it if exist
			Box = window.document.getElementById(BoxId);
			try 
			{
				Box.parentNode.removeChild(Box);
				Box = null;
			} catch(e) {}

            //creating dialog box
			Box = window.document.createElement('div');
			Box.setAttribute('id', BoxId);
			Box.className = "";
			window.document.body.appendChild(Box);

			//adding eventlistener for escape key to remove dialog box
			window.document.addEventListener('keydown', 
				function(eventObj) {
					if (eventObj.keyCode == '27' && Box) 
					{
						Box.parentNode.removeChild(Box);
						Box = null;
					}
				}
			, false);

			var localisedSiteName = chrome.i18n.getMessage(Sites[Hostname].name + 'Site');
			var header = chrome.i18n.getMessage('header');
			header = header.replace('drwebLinkName', localisedSiteName);
			header = header.replace('drwebLinkDesc', url);
			var mainText = chrome.i18n.getMessage('mainText');
			mainText = mainText.replace('drwebLinkName', localisedSiteName);
			var additionalText = chrome.i18n.getMessage('additionalText');
			additionalText = additionalText.replace(/drwebLinkName/g, localisedSiteName);

			Box.innerHTML = '<div id="drwebConfirmationBox"><div id="drwebConfirmationHeader"><img src="' + chrome.extension.getURL('content/css/images/logo.png') +'" alt="' + chrome.i18n.getMessage('antivirusTitle')+ '" /></div><div id="drwebConfirmationContent"><div id="'+BoxLeftColumnId+'" class="drwebWarning"></div><div id="'+BoxRightColumnId+'">' + header + mainText + '<p class="last"><a id="'+BoxDrWebDescriptionLink+'" href="#drweb_description" onclick="return false;">' + chrome.i18n.getMessage('whyWarning') + '</a></p><div id="drweb_description" style="display: none;"><a name="drweb_description"></a><div class="last">' + additionalText + '</div></div></div></div><div id="drwebConfirmationFooter"><form id="'+BoxFormId+'" action="" method="get" accept-charset="utf-8" onsubmit="return false;"><button type="submit" id="'+BoxButtonSubmitId+'" disabled="disabled">' + chrome.i18n.getMessage('scanning') + ' <img src="' + chrome.extension.getURL('content/css/images/loadingImage.gif') + '" /></button><input id="'+BoxButtonCloseId+'" type="button" value="' + chrome.i18n.getMessage('close') + '" onclick=";" /></form></div></div>';

			// adding event listeners for description link, close button and submit
			window.document.getElementById(BoxDrWebDescriptionLink).addEventListener('click', function(eventObj) { Toggle(BoxDrWebDescription);}, true);
			window.document.getElementById(BoxButtonCloseId).addEventListener('click', HandleBoxClose, false);
			window.document.getElementById(BoxId).addEventListener('submit', function(eventObj) { HandleBoxFormSubmit(url, eventObj); }, false);
		}

		//open link from dialog handler
		HandleBoxFormSubmit = function(url, eventObj)
		{
			window.open(url);
			if(Box)
			{
				Box.parentNode.removeChild(Box);
				Box = null;
			}
			eventObj.preventDefault();
			eventObj.stopPropagation();
			return false;
		}

	    //close dialog handler
		HandleBoxClose = function(eventObj)
		{
			if(Box)
			{
				Box.parentNode.removeChild(Box);
				Box = null;
			}
			eventObj.preventDefault();
			eventObj.stopPropagation();
			return false;
		}

		//show or hide dialog description
		Toggle = function(id)
		{
			var el = window.document.getElementById(id);
			el.style.display = (el.style.display == 'block' ? 'none' : 'block');
			return false;
		}
		
		HandleMessages = function(request, sender, sendResponse) 
		{
			try
			{
				var func = eval(request.action);
			} 
			catch(e) 
			{
				return false;
			}
			if(typeof func == 'function') {
				func(request, sender, sendResponse);
			}
		}
		
		HandleContextMenu = function(request, sender, sendResponse)
		{
			var selectedText = request.selectionText;
			var url;
			var result;
			
			if(!selectedText)
				return false;

			result = request.isLink? LinkHrefRegexp.exec(selectedText) : LinkInTextRegexp.exec(selectedText);

			if(result)
			{
				var url = (result[1]? result[1] : 'http://') + result[2];
				if(typeof Sites[Hostname] != "undefined")
				{
					var url = Sites[Hostname].linkFunction(url);
				}
				if(url)
				{
					var width = 640;
					var height = 400;
					var lng = chrome.i18n.getMessage("lng");
					var win = window.open('http://online.drweb.com/result/?lng='+lng+'&chromeplugin=1&url=' + encodeURIComponent(url), 'drweb_online_check', 'type=popup,width=' + width + ', height=' + height + ',top=' + Math.ceil(window.screen.height-height)/2 + ',left=' + Math.ceil(window.screen.width-width)/2);
					return true;
				}
				else
				{
					alert(chrome.i18n.getMessage("noExtLinksInSelection"));
					return false;
				}
			}
			alert(chrome.i18n.getMessage("noLinksInSelection"));
			return false;
		}

        //decoding url
		DecodeURIComponentFix = function(str)
		{
			var str;
			try
			{
			    //standart JS function
				str = decodeURIComponent(str);
			} 
			catch(e)
			{
			    //on exception to utf
				str = Cp2Utf(unescape(str));
			}
			return str;
		}

		//to utf converting by char
		Cp2Utf = function(txt)  
		{
			var out = '';
			for(var i = 0; i < txt.length; i++)
			{
				var ch = txt.charCodeAt(i);
				if(ch >= 192 && ch <= 255)
					out += String.fromCharCode(ch+848);
				else if(ch == 168)
					out += String.fromCharCode(ch+937);
				else if(ch == 184)
					out += String.fromCharCode(ch+841);
				else 
					out += txt[i];
			}
			return out;
		}

        //initialize content
        contentsInit = function()
        {
            hideBlockedItems2();
            if (social_enabled == "true"){
                hideElement(socialPatterns, "a", "href");
                hideElement(socialPatterns, "iframe", "src");
            }
            if (track_enabled == "true")
            {
                hideCounters(countersPatts, "a", "href");
                hideCounters(countersPatts, "img", "src");
            }
            if (flashException)
            {
                if (!flashException.allow)
                {
                   hideFlash();
                }
            }
            else if (flash_enabled == "true"){
                hideFlash();
            }

            if (adsException)
            {
                if (!adsException.allow)
                {
                    if (!isItSocialNetwork())
                    {
                        hideElement(adsPatterns, "a", "href");
                        hideElement(adsPatterns, "iframe", "src");
                        hideSpecTags("yatag");
                        hideSpecTags("ins");
                    }
                    else
                    {
                        for (var i = 0; i< specSocialBlocks.length; i++)
                        {
                            hideSpecialBlocks(specSocialBlocks[i]);
                        }
                    }
                }
            }
            else if (ads_enabled == "true"){
                 if (!isItSocialNetwork())
                 {
                    hideElement(adsPatterns, "a", "href");
                    hideElement(adsPatterns, "iframe", "src");
                    hideSpecTags("yatag");
                    hideSpecTags("ins");
                 }
                 else
                 {
                     for (var i = 0; i< specSocialBlocks.length; i++)
                     {
                         hideSpecialBlocks(specSocialBlocks[i]);
                     }
                 }
            }

            if (manualHidingMode == false)
            {
                if ($('#infoBox'))
                    $('#infoBox').remove();

                $('body').prepend("<div id='infoBox' style='z-index: 360000; font-family: PT Sans, Trebushet MS, sans-serif; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(rgba(122, 189, 25,0.9)), to(rgba(102, 167, 16,0.9))); margin-top:-3em; position:fixed; top:3em; left: 0; float: left; width: 100%; color: #fff; padding: 1em; font-size: 11pt; height: 20px; display: none; text-align: left;'>" +
                chrome.i18n.getMessage('manualBlockingText') +
                "<div id='saveBlocksButton' style='color: #fff; text-shadow: none; cursor: pointer;display: inline;margin-left: 1.6em;padding: 0.5em 0.8em 0.5em 0.8em;background: rgb(102, 167, 16);border-radius: 5px;'>" + chrome.i18n.getMessage('manualBlockingSave') + "</div>" +
                "<div id='cancelAddBlocksButton' style='color: #fff; text-shadow: none; cursor: pointer;display: inline;margin-left: 1.6em;padding: 0.5em 0.8em 0.5em 0.8em;background: rgb(102, 167, 16);border-radius: 5px;'>" + chrome.i18n.getMessage('manualBlockingCancel') + "</div>" +
                "</div>");
                //$('body').prepend("<div id='backBox' style='z-index: -1; background: #000; opacity: 0.5; position:fixed; width: 100%; height: 100%; top 0; bottom: 0; left: 0; right: 0; display: none;'></div>");
            }
        }

        //social
        isItSocialNetwork = function()
        {
            var socialURLs = new Array("vkontakte.ru", "vk.com", "facebook.com", "fb.com", "plus.google.com");
            for (var i = 0; i< socialURLs.length; i++)
            {
                if (actualURL.indexOf(socialURLs[i]) != -1)
                {
                    return true;
                }
            }

            return false;
        }

        //social
        getSocialNetworkPref = function()
        {
            var socialURLs = new Array("vkontakte.ru", "vk.com", "facebook.com", "fb.com", "plus.google.com");
            for (var i = 0; i< socialURLs.length; i++)
            {
                if (document.URL.indexOf(socialURLs[i]) != -1)
                {
                    if (i < 2)
                        return "vk";
                    else if (i < 4)
                        return "fb";
                    else
                        return "gl";
                }
            }

            return "";
        }

        //hide special blocks like Ads in VK, Facebook
        hideSpecialBlocks = function(specSocialBlock)
        {
            var ids = specSocialBlock.id.split("%");
            for (var j = 0; j< ids.length; j++)
            {
                if (ids[j] != "")
                    $("#" + ids[j]).remove();
            }
            ids = null;

            var classes = specSocialBlock.className.split("%");
            for (var j = 0; j< classes.length; j++)
            {
                if (classes[j] != "")
                    $("." + classes[j]).remove();
            }
            classes = null;
        }

        hideBlockedItems2 = function()
        {
            if (blockedItems != null && blockedItems != undefined && blockedItems != "" && blockedItems != "null")
                var blockedParts = JSON.parse(blockedItems);
            if (blockedParts)
            {
                var divs = document.getElementsByTagName("DIV");
                var spans = document.getElementsByTagName("SPAN");
                var imgs = document.getElementsByTagName("IMG");
                var tables = document.getElementsByTagName("TABLE");
                var objs = document.getElementsByTagName("OBJECT");
                var embeds = document.getElementsByTagName("EMBED");
                for (var i=0; i < blockedParts.length; i++){
                    var item = blockedParts[i];
                    if (item.baseURL == baseURL && item.block)// && item.actualURL == actualURL)
                    {
                        for(var j = 0; j < divs.length; j++)
                        {
                            if ((divs[j].className == item.className || (divs[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "DIV")
                            {
                                if (item.DOMstring == getDOMstring(divs[j]))
                                {
                                    divs[j].style.display = "none";
                                    divs[j].setAttribute("hidden","true");
                                    divs[j].parentNode.removeChild(divs[j]);
                                }
                            }
                        }

                        for(var j = 0; j < spans.length; j++)
                        {
                            if ((spans[j].className == item.className || (spans[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "SPAN")
                            {
                                if (item.DOMstring == getDOMstring(spans[j]))
                                {
                                    spans[j].style.display = "none";
                                    spans[j].setAttribute("hidden","true");
                                    spans[j].parentNode.removeChild(spans[j]);
                                }
                            }
                        }

                        for(var j = 0; j < imgs.length; j++)
                        {
                            if ((imgs[j].className == item.className || (imgs[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "IMG")
                            {
                                if (item.DOMstring == getDOMstring(imgs[j]))
                                {
                                    imgs[j].style.display = "none";
                                    imgs[j].setAttribute("hidden","true");
                                    imgs[j].parentNode.removeChild(imgs[j]);
                                }
                            }
                        }

                        for(var j = 0; j < tables.length; j++)
                        {
                            if (tables[j].className == item.className && item.tagName == "TABLE")
                            {
                                if (item.DOMstring == getDOMstring(tables[j]))
                                {
                                    tables[j].style.display = "none";
                                    tables[j].setAttribute("hidden","true");
                                    tables[j].parentNode.removeChild(tables[j]);
                                }
                            }
                        }
                        for(var j = 0; j < objs.length; j++)
                        {
                            if (item.DOMstring == getDOMstring(objs[j]))
                            {
                                objs[j].style.display = "none";
                                objs[j].setAttribute("hidden","true");
                                objs[j].parentNode.removeChild(objs[j]);
                            }
                        }
                        for(var j = 0; j < embeds.length; j++)
                        {
                            if (item.DOMstring == getDOMstring(embeds[j]))
                            {
                                embeds[j].style.display = "none";
                                embeds[j].setAttribute("hidden","true");
                                embeds[j].parentNode.removeChild(embeds[j]);
                            }
                        }
                    }
                }
                divs = null;
                tables = null;
            }
        }

        showBlockedItems2 = function()
        {
            if (blockedItems != null && blockedItems != undefined && blockedItems != "" && blockedItems != "null")
                var blockedParts = JSON.parse(blockedItems);
            if (blockedParts)
            {
                var divs = document.getElementsByTagName("DIV");
                var spans = document.getElementsByTagName("SPAN");
                var imgs = document.getElementsByTagName("IMG");
                var tables = document.getElementsByTagName("TABLE");
                var objs = document.getElementsByTagName("OBJECT");
                var embeds = document.getElementsByTagName("EMBED");
                for (var i=0; i < blockedParts.length; i++){
                    var item = blockedParts[i];
                    if (item.baseURL == baseURL && item.block)// && item.actualURL == actualURL)
                    {
                        for(var j = 0; j < divs.length; j++)
                        {
                            if ((divs[j].className == item.className || (divs[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "DIV")
                            {
                                if (item.DOMstring == getDOMstring(divs[j]) && divs[j].getAttribute("hidden") == "true")
                                {
                                    divs[j].style.display = "block";
                                    divs[j].style.opacity = "0.4";
                                }
                            }
                        }

                        for(var j = 0; j < spans.length; j++)
                        {
                            if ((spans[j].className == item.className || (spans[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "SPAN")
                            {
                                if (item.DOMstring == getDOMstring(spans[j]) && spans[j].getAttribute("hidden") == "true")
                                {
                                    spans[j].style.display = "block";
                                    spans[j].style.opacity = "0.4";
                                }
                            }
                        }

                        for(var j = 0; j < imgs.length; j++)
                        {
                            if ((imgs[j].className == item.className || (imgs[j].id == item.id && item.id != null && item.id != ""))  && item.tagName == "IMG")
                            {
                                if (item.DOMstring == getDOMstring(imgs[j]) && imgs[j].getAttribute("hidden") == "true")
                                {
                                    imgs[j].style.display = "block";
                                    imgs[j].style.opacity = "0.4";
                                }
                            }
                        }

                        for(var j = 0; j < tables.length; j++)
                        {
                            if (tables[j].className == item.className && item.tagName == "TABLE")
                            {
                                if (item.DOMstring == getDOMstring(tables[j]) && tables[j].getAttribute("hidden") == "true")
                                {
                                    tables[j].style.display = "block";
                                    tables[j].style.opacity = "0.4";
                                }
                            }
                        }
                        for(var j = 0; j < objs.length; j++)
                        {
                            if (item.DOMstring == getDOMstring(objs[j]) && objs[j].getAttribute("hidden") == "true")
                            {
                                objs[j].style.display = "block";
                                objs[j].style.opacity = "0.4";
                            }
                        }
                        for(var j = 0; j < embeds.length; j++)
                        {
                            if (item.DOMstring == getDOMstring(embeds[j]) && embeds[j].getAttribute("hidden") == "true")
                            {
                                embeds[j].style.display = "block";
                                embeds[j].style.opacity = "0.4";
                            }
                        }
                    }
                }
                divs = null;
                tables = null;
            }
        }

        //add event hadler on mouse over
        addMouserOverEvent = function()
        {
              window.document.addEventListener('click', HandleLinkClick, true);
        	  window.document.addEventListener('mouseup', HandleLinkClick, true);

              var info = document.getElementById("infoBox");
              info.style.display = "block";
              document.getElementById("saveBlocksButton").onmouseover = function(){ document.getElementById("saveBlocksButton").style.background = "-webkit-linear-gradient(top, #f1da36 0%,#f9ec75 100%)"; document.getElementById("saveBlocksButton").style.color = "#000"; };
              document.getElementById("saveBlocksButton").onmouseout = function(){document.getElementById("saveBlocksButton").style.color = "#fff"; document.getElementById("saveBlocksButton").style.background = "rgb(102, 167, 16)";};
              document.getElementById("cancelAddBlocksButton").onmouseover = function(){ document.getElementById("cancelAddBlocksButton").style.background = " -webkit-linear-gradient(top, #f1da36 0%,#f9ec75 100%)"; document.getElementById("cancelAddBlocksButton").style.color = "#000";};
              document.getElementById("cancelAddBlocksButton").onmouseout = function(){document.getElementById("cancelAddBlocksButton").style.color = "#fff"; document.getElementById("cancelAddBlocksButton").style.background = "rgb(102, 167, 16)";};
              //showElementsForBlocking();
              //var backBox = document.getElementById("backBox");
              //backBox.style.display = "block";

              var saveBlocksButton = document.getElementById("saveBlocksButton");
              var cancelAddBlocksButton = document.getElementById("cancelAddBlocksButton");

              var info = document.getElementById("infoBox");
              info.style.display = "block";

              if (info.offsetHeight < 45)
                  info.style.height = "50px";

              document.body.style.marginTop = info.offsetHeight + "px";
              saveBlocksButton.onclick = saveBlocks;
              cancelAddBlocksButton.onclick = cancelAddBlocks;
              document.onmouseover = showInfo;
              document.onmouseout = hideInfo;
              //showBlockedItems2();
        }

        //cancelAddBlocks
        cancelAddBlocks = function()
        {
            window.document.removeEventListener('click', HandleLinkClick, true);
            window.document.removeEventListener('mouseup', HandleLinkClick, true);

            removeMouserOverEvent();
            block_mode = false;
            manualHidingMode = false;
            showBackFlash(document.getElementsByTagName("DIV"));
            showBackFlash(document.getElementsByTagName("SPAN"));
            showBackImages(document.getElementsByTagName("IMG"));
            showBackFlash(document.getElementsByTagName("OBJECT"));
            showBackFlash(document.getElementsByTagName("EMBED"));
            showBackFlash(document.getElementsByTagName("TABLE"));
            showBackFlash(document.getElementsByTagName("INS"));

            chrome.extension.sendMessage({'action' : 'disableBlockMode'}, function(response) {});
        }

        showBackFlash = function(divs){
             for(var i = 0; i < divs.length; i++)
             {
                  if (divs[i].getAttribute("drwebblocked") == "true")
                  {
                      divs[i].setAttribute("drwebblocked", false);
                      divs[i].style.opacity = "";
                      divs[i].style.background = "";
                      for (var k =0; k < divs[i].children.length; k++)
                      {
                          divs[i].children[k].style.display = "block";
                          if (divs[i].children[k].getAttribute("flashlock") == "true")
                              divs[i].children[k].style.display = "none";
                      }
                  }
             }
        }

        showBackImages = function(imgs){
          for(var i = 0; i < imgs.length; i++)
          {
               if (imgs[i].getAttribute("drwebblocked") == "true")
               {
                   imgs[i].setAttribute("src", imgs[i].getAttribute("oldSrc"));
                   imgs[i].style.opacity = "";
                   imgs[i].style.background = "";
               }
          }
        }

        //saveBlocks
        saveBlocks = function(){
           var divs = document.getElementsByTagName("DIV");
           for(var i = 0; i < divs.length; i++)
           {
                if (divs[i].getAttribute("drwebblocked") == "true" || divs[i].getAttribute("flashLock") == "true")
                {
                    divs[i].style.display = "none";
                }
           }
           var spans = document.getElementsByTagName("SPAN");
           for(var i = 0; i < spans.length; i++)
           {
                if (spans[i].getAttribute("drwebblocked") == "true" || spans[i].getAttribute("flashLock") == "true")
                {
                    spans[i].style.display = "none";
                }
           }
           var tables = document.getElementsByTagName("TABLE");
           for(var i = 0; i < tables.length; i++)
           {
                if (tables[i].getAttribute("drwebblocked") == "true")
                {
                    tables[i].style.display = "none";
                }
           }
           var imgs = document.getElementsByTagName("IMG");
          for(var i = 0; i < imgs.length; i++)
          {
               if (imgs[i].getAttribute("drwebblocked") == "true")
               {
                   imgs[i].style.display = "none";
               }
          }
           block_mode = false;
           manualHidingMode = false;
           removeMouserOverEvent();
           chrome.extension.sendMessage({'action' : 'saveBlocks', blocks: blocks}, function(response) {});
           blocks = new Array();
        }

        //remove event hadler on mouse over
        removeMouserOverEvent = function()
        {
              var info = document.getElementById("infoBox");
              info.style.display = "none";
              document.body.style.marginTop = "0em";
              document.onmouseover = null;
              document.onmouseout = null;
        }

        //show highlight on mouseover
        showInfo = function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;
             if (target.id != "infoBox" && target.id != "saveBlocksButton" && target.id != "cancelAddBlocksButton" && target.id != "backBox"
                 && (target.tagName == "DIV" || target.tagName == "SPAN" || target.tagName == "TD" || target.tagName == "IFRAME" || target.tagName == "EMBED" || target.tagName == "OBJECT" || target.tagName == "IMG"))
             {
                 var flashObj = false;
                 if (target.tagName == "TD" && target.parentNode.tagName == "TR")
                 {
                    target = target.parentNode;
                    if (target.parentNode.tagName == "TBODY")
                    {
                       target = target.parentNode;
                    }
                    if (target.parentNode.tagName == "TABLE")
                    {
                        target = target.parentNode;
                    }
                 }
                 else if (target.tagName == "IFRAME" || target.tagName == "EMBED" || target.tagName == "OBJECT")
                 {
                    var div = document.createElement("div");
                    var widthObj =  target.offsetWidth;
                    var heightObj =  target.offsetHeight;

                    if (!div.hasAttribute("oldBack")){
                         div.setAttribute("oldBack", div.style.background);
                         div.setAttribute("oldBackSize", div.style.backgroundSize);
                    }

                    div.style.width = widthObj + "px";
                    div.style.height = heightObj + "px";
                    div.style.background = "url(data:image/gif;base64,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)";

                    div.setAttribute("flashLock", true);

                    target.parentNode.appendChild(div);
                    target.style.display = "none";
                    flashHidden = true;
                    target.onclick = blockParent;
                    target = target.parentNode;
                    flashObj = true;
                 }
                 else if (target.tagName == "IMG")
                 {
                     if (!target.hasAttribute("oldSrc"))
                          target.setAttribute("oldSrc", target.getAttribute("src"));
                     target.setAttribute("src", "data:image/gif;base64,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");
                     target.onclick = blockThis;
                     return;
                 }
                 if (target.getAttribute("drwebblocked") != "true" && (checkForBlocking(target) || flashObj) && target.tagName != "TD" && target.tagName != "TR")
                 {
                     if (!target.hasAttribute("oldBack")){
                          target.setAttribute("oldBack", target.style.background);
                          target.setAttribute("oldBackSize", target.style.backgroundSize);
                     }
                     target.style.background = "url(data:image/gif;base64,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)";
                     target.onclick = blockThis;
                     target.onmouseout = showFlashBack;

                     infoString = target.id + " | " + target.tagName + " | " + target.className;
                 }
             }
        }


        checkForBlocking = function(target)
        {
            return true;
        }

        //blocked item - structure of database item
        blockedItem = function(id, baseURL, actualURL, tagName, className, prtNodeClass, prtGrandNodeClass, DOMstring)
        {
            this.id = id;
            this.baseURL = baseURL;
            this.actualURL = actualURL;
            this.tagName= tagName;
            this.className= className;
            this.prtNodeClass = prtNodeClass;
            this.prtGrandNodeClass = prtGrandNodeClass;
            this.DOMstring = DOMstring;
        }

        //block parent
        blockParent = function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;
             target = target.parent;
             var DOMstring = getDOMstring(target);

             blocks.push(new blockedItem(
                             target.id,
                             baseURL,
                             actualURL,
                             target.tagName,
                             target.className,
                             target.parentNode ? target.parentNode.className : null,
                             target.parentNode ? target.parentNode.parentNode ? target.parentNode.parentNode.className : null : null,
                             DOMstring
                          ));
             target.setAttribute("drwebBlocked", true);
             target.style.opacity = "0.1";
        }

        //blocking element
        blockThis = function(e)
        {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            if (target.getAttribute("flashlock"))
            {
                target.onmouseout = null;
                target.style.opacity = "0.1";
                target = target.parentNode;
                for (var i=0; i< target.children.length; i++)
                 {
                     if (target.children[i].tagName == "IFRAME" || target.children[i].tagName == "EMBED" || target.children[i].tagName == "OBJECT")
                     {
                        target.setAttribute("drwebBlocked", true);
                     }
                 }
            }
            if (target.tagName == "TD" && target.parentNode.tagName == "TR")
            {
               target = target.parentNode;
               if (target.parentNode.tagName == "TBODY")
               {
                  target = target.parentNode;
               }
               if (target.parentNode.tagName == "TABLE")
               {
                   target = target.parentNode;
               }
            }

            var DOMstring = getDOMstring(target);

            blocks.push(new blockedItem(
                            target.id,
                            baseURL,
                            actualURL,
                            target.tagName,
                            target.className,
                            target.parentNode ? target.parentNode.className : null,
                            target.parentNode ? target.parentNode.parentNode ? target.parentNode.parentNode.className : null : null,
                            DOMstring
                         ));
            target.onclick = unblockThis;
            target.setAttribute("drwebBlocked", true);
            target.style.opacity = "0.1";
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        //unblocking hidden element
        unblockThis = function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;
             if (target.getAttribute("flashlock"))
             {
                 flashHidden = false;
                 target.onmouseout = null;
                 target.style.display = "none";
                 target = target.parentNode;
                 for (var i=0; i< target.children.length; i++)
                 {
                     if (target.children[i].tagName == "IFRAME" || target.children[i].tagName == "EMBED" || target.children[i].tagName == "OBJECT")
                     {
                         target.children[i].style.display = "block";
                     }
                 }
             }
             if (target.tagName == "TD" && target.parentNode.tagName == "TR")
             {
                target = target.parentNode;
                if (target.parentNode.tagName == "TBODY")
                {
                   target = target.parentNode;
                }
                if (target.parentNode.tagName == "TABLE")
                {
                    target = target.parentNode;
                }
             }
             var DOMstring = getDOMstring(target);
             for (var i=0; i<blocks.length; i++)
             {
                if (blocks[i].DOMstring == DOMstring)
                {
                    blocks.splice(i, 1);
                    break;
                }
             }
             if (target.tagName == "IMG")
                target.setAttribute("src", target.getAttribute("oldSrc"));
             target.setAttribute("drwebBlocked", false);
             target.style.opacity = "";
             target.style.background = "";
             if (target.hasAttribute("oldBack")){
                 target.style.background = target.getAttribute("oldBack");
                 target.style.backgroundSize = target.getAttribute("oldBackSize");
             }
             target.onclick = blockThis;
             e.preventDefault();
             e.stopPropagation();
             return false;
        }

        //get unique DOM string which is identifier for block
        getDOMstring = function(target)
        {
            var DOMstring = "";
            var parentTaregtNode = target.parentNode;
            var chlsNumber = 0;
            var decrement = 0;
            for (var i=0; i<parentTaregtNode.children.length; i++)
            {
                if (parentTaregtNode.children[i].id == "infoBox")
                    decrement = 1;
                if (parentTaregtNode.children[i] == target)
                {
                     chlsNumber = i - decrement;
                     break;
                }
            }
            var childrenCount = 0;
            for (var i=0; i<target.children.length; i++)
            {
                var child = target.children[i];
                if (child.getAttributes && child.getAttributes("flashLock") == null)
                {
                    childrenCount++;
                }
            }

            var actualChildElemetsCount = 0;
            for (var i=0; i<parentTaregtNode.children.length; i++)
            {
                 if (parentTaregtNode.children[i].id != "infoBox")
                    actualChildElemetsCount++;
            }
            //target.childElementCount
            DOMstring += "[" + actualChildElemetsCount + "]" + "[" + "]" + "[" + "]" + "[" + chlsNumber + "]";
            var childNumber = 0;
            var toIdent = target;
            while (parentTaregtNode.tagName != "BODY")
            {
                for (var i=0; i<parentTaregtNode.children.length; i++)
                {
                    if (parentTaregtNode.children[i] == toIdent)
                    {
                         childNumber = childNumber + i;
                         break;
                    }
                }
                DOMstring += parentTaregtNode.tagName + "&" + parentTaregtNode.className + "%" + childNumber + "%";
                toIdent = parentTaregtNode;
                parentTaregtNode = parentTaregtNode.parentNode;
                if (target.tagName == "OBJECT" || target.tagName == "EMBED")
                    break;
            }
            return DOMstring;
        }

        //flag to show that flash is already hidden
        var flashHidden = false;

        //show flash or iframe on mouseout
        showFlashBack = function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;
             var parent = target.parentNode;
             if (target.tagName != "EMBED" && target.tagName != "IFRAME" && target.tagName != "OBJECT" && flashHidden)
             {
                if (parent.getAttribute("drwebblocked") != "true")
                {
                    if (parent.lastChild && parent.lastChild.style && parent.lastChild.getAttribute("flashlock") == "true")
                    {
                        parent.lastChild.style.display = "none";
                        for (var i=0; i< parent.children.length; i++)
                        {
                            if (parent.children[i].tagName == "IFRAME" || parent.children[i].tagName == "EMBED" || parent.children[i].tagName == "OBJECT")
                            {
                                parent.children[i].style.display = "block";
                            }
                        }
                        parent.style.opacity = "";
                        parent.style.background = "";
                        parent.onclick = null;
                        flashHidden = false;
                    }
                }
             }
        }

        //hide highlights on mouseout
        hideInfo = function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;
             if (target.id != "infoBox" && target.id != "saveBlocksButton" && target.id != "cancelAddBlocksButton" && target.id != "backBox"
                 && (target.tagName == "DIV" || target.tagName == "SPAN" || target.tagName == "TD" || target.tagName == "IMG"))
             {
                  if (target.tagName == "TD" && target.parentNode.tagName == "TR")
                  {
                     target = target.parentNode;
                     if (target.parentNode.tagName == "TBODY")
                     {
                        target = target.parentNode;
                     }
                     if (target.parentNode.tagName == "TABLE")
                     {
                         target = target.parentNode;
                     }
                  }
                 if (target.getAttribute("drwebblocked") != "true" && checkForBlocking(target))
                 {
                     if (target.tagName == "IMG")
                        target.setAttribute("src",target.getAttribute("oldSrc"));
                     target.style.opacity = "";
                     target.style.background = "";
                     if (target.hasAttribute("oldBack")){
                         target.style.background = target.getAttribute("oldBack");
                         target.style.backgroundSize = target.getAttribute("oldBackSize");
                     }
                     target.onclick = null;
                 }
             }
        }

        //hide flash
        hideFlash = function()
        {
                var elementsObjects = document.getElementsByTagName("object");
                for (var j=0; j < elementsObjects.length; j++){
                    elementsObjects[j].style.display = "none";
                }
                var elementsEmbed = document.getElementsByTagName("embed");
                for (var j=0; j < elementsEmbed.length; j++){
                    elementsEmbed[j].style.display = "none";
                }
        }

        //hiding element by pattern
        hideElement = function(patterns, tag, attribute)
        {
              if (patterns)
              {
                  var elements = document.getElementsByTagName(tag);
                  for (var j=0; j < elements.length; j++){
                       if (elements[j].getAttribute(attribute))
                       {
                           for (var i=0; i < patterns.length; i++){
                              var patt = RegExp(patterns[i].patt);
                              if (patt.test(elements[j].getAttribute(attribute))){
                                  elements[j].style.display = "none";
                              }
                           }
                       }
                  }
              }
        }

        hideSpecTags = function(tag)
        {
              var elements = document.getElementsByTagName(tag);
              for (var j=0; j < elements.length; j++){
                  $(elements[j]).remove();
              }
        }

        hideElement2 = function(pattern, tag, attribute)
        {
              if (pattern)
              {
                  var elements = document.getElementsByTagName(tag);
                  for (var j=0; j < elements.length; j++){
                       if (elements[j].getAttribute(attribute))
                       {
                          var src = elements[j].getAttribute(attribute);
                          var patt = RegExp(pattern);
                          if (patt.test(src)){
                              elements[j].style.display = "none";
                          }
                       }
                  }
              }
        }

        hideCounters = function(patterns, tag, attribute)
        {
              if (patterns.length > 0)
              {
                  var elements = document.getElementsByTagName(tag);
                  for (var j=0; j < elements.length; j++){
                       if (elements[j].getAttribute(attribute))
                       {
                          var src = elements[j].getAttribute(attribute);
                          if (src)
                          {
                              for (var i=0; i < patterns.length; i++){
                                 var patt = RegExp(patterns[i]);
                                 if (patt.test(src)){
                                     elements[j].style.display = "none";
                                 }
                              }
                          }
                       }
                  }
              }
        }


		//chrome.extension.sendMessage({'action' : 'sendParams'}, callbackFunction);
		chrome.extension.onMessage.addListener(HandleMessages);

        function callbackFunction(response) {
              socialPatterns = new Array();
              adsPatterns = new Array();
              specSocialBlocks = new Array();
              adsException = new Array();
              flashException = new Array();

              adsPatterns = response.adsPatterns;
              socialPatterns = response.socialPatterns;
              ads_enabled = response.ads;
              social_enabled = response.social;
              analytics_enabled = response.analytics;
              track_enabled = response.track;
              flash_enabled = response.flash;
              adsException = response.adsException;
              flashException = response.flashException;
              block_mode = response.blockMode;
              baseURL = response.tabURL.split( '/' )[2];
              actualURL = response.tabURL;
              blockedItems = response.blockedItems;
              specSocialBlocks = response.specSocialBlocks;
              countersPatts = response.countersPatts;

              contentsInit();
              setTimeout(function(){contentsInit();}, 1000);
        }
        //getting settings for extension and adding handlers for clicking
        try{
            chrome.extension.sendMessage({'action' : 'GetOptions'}, HandleGetOptions);
        }
        catch(err){}

        document.addEventListener('DOMContentLoaded', function(){ contentsInit();}, false);

        var firstTime = true;
        switchMode = function(mode){
            mode == "true" ? block_mode = false : block_mode = true;
            if (!block_mode)
            {
                addMouserOverEvent();
                manualHidingMode = true;
                block_mode = true;
                chrome.extension.sendMessage({'action' : 'enableBlockMode'}, function(response) {});
            }
            else
            {
                removeMouserOverEvent();
                manualHidingMode = false;
                block_mode = false;
                chrome.extension.sendMessage({'action' : 'disableBlockMode'}, function(response) {});
            }
        }

        showRefreshMessage = function()
        {
              if (!document.getElementById("refreshBox")){
                  $('body').prepend("<div id='refreshBox' style='z-index: 360000; font-family: PT Sans, Trebushet MS, sans-serif; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(rgba(122, 189, 25,0.9)), to(rgba(102, 167, 16,0.9))); margin-top:-3em; position:fixed; top:3em; left: 0; float: left; width: 100%; color: #fff; padding: 1em; font-size: 11pt; height: 20px; text-align: left;'>" +
                   chrome.i18n.getMessage('refreshBox') +
                  "<div id='refreshButton' style='color: #fff; text-shadow: none; cursor: pointer;display: inline;margin-left: 1.6em;padding: 0.5em 0.8em 0.5em 0.8em;background: rgb(102, 167, 16);border-radius: 5px;'>" +  chrome.i18n.getMessage('refreshButton') + "</div>" +
                  "<div id='cancelRefreshButton' style='color: #fff; text-shadow: none; cursor: pointer;display: inline;margin-left: 1.6em;padding: 0.5em 0.8em 0.5em 0.8em;background: rgb(102, 167, 16);border-radius: 5px;'>" +  chrome.i18n.getMessage('refreshCancelButton') + "</div>" +
                  "</div>");
                  document.getElementById("refreshButton").onmouseover = function(){ document.getElementById("refreshButton").style.background = "-webkit-linear-gradient(top, #f1da36 0%,#f9ec75 100%)"; document.getElementById("refreshButton").style.color = "#000"; };
                  document.getElementById("refreshButton").onmouseout = function(){document.getElementById("refreshButton").style.color = "#fff"; document.getElementById("refreshButton").style.background = "rgb(102, 167, 16)";};
                  document.getElementById("cancelRefreshButton").onmouseover = function(){ document.getElementById("cancelRefreshButton").style.background = " -webkit-linear-gradient(top, #f1da36 0%,#f9ec75 100%)"; document.getElementById("cancelRefreshButton").style.color = "#000";};
                  document.getElementById("cancelRefreshButton").onmouseout = function(){document.getElementById("cancelRefreshButton").style.color = "#fff"; document.getElementById("cancelRefreshButton").style.background = "rgb(102, 167, 16)";};

                  var refreshBox1 = document.getElementById("refreshBox");
                    if (refreshBox1.offsetHeight < 45)
                            refreshBox1.style.height = "50px";

                  var refreshButton = document.getElementById("refreshButton");
                  var cancelRefreshButton = document.getElementById("cancelRefreshButton");

                  refreshButton.onclick = function(){ document.location.reload(true); };
                  cancelRefreshButton.onclick = function(){ document.getElementById("refreshBox").style.display = "none"; };
              }
              else document.getElementById("refreshBox").style.display = "block";
        }

        var HandleCheckSocialSettings = function(message){

            if(Options[Sites[Hostname].name+'-check'].toString() != message.options[Sites[Hostname].name+'-check'].toString())
            {
                 showRefreshMessage();
            }
        }

        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            if (request)
            {
                if (request.mode == "updateTabData")
                {
                    try{
                    chrome.extension.sendMessage({'action' : 'GetOptions'}, HandleGetOptions);
                    }
                    catch(err){}
                }
                else if (request.mode == "refresh" || (request.mode == "refreshsocial-" + getSocialNetworkPref()))
                {
                    showRefreshMessage();
                }
                else if (request.mode == "refresh-special")
                {
                    if (request.urls){
                        var urls1 = JSON.parse(request.urls);
                        for(var i = 0; i < urls1.length; i++)
                        {
                            if (urls1[i].replace("www.", "") == document.location.host.replace("www.", ""))
                            {
                                showRefreshMessage();
                            }
                        }
                    }
                }
                else
                {
                    if (request.mode != "")
                        switchMode(request.mode);
                    else {
                        if (request.patt)
                        {
                            if (document.readyState == "interactive")
                            {
                                hideElement2(request.patt, "a", "href");
                                hideElement2(request.patt, "iframe", "src");
                                hideElement2(request.patt, "img", "src");
                                hideElement(request.adsPatterns, "a", "href");
                                hideElement(request.adsPatterns, "iframe", "src");
                            }
                            else
                            {
                                setTimeout(function(){
                                    hideElement2(request.patt, "a", "href");
                                    hideElement2(request.patt, "iframe", "src");
                                    hideElement2(request.patt, "img", "src");
                                    hideElement(request.adsPatterns, "a", "href");
                                    hideElement(request.adsPatterns, "iframe", "src");
                                }, 1000);
                            }
                        }
                        if (request.specSocialBlocks)
                        {
                           for (var i = 0; i< request.specSocialBlocks.length; i++)
                           {
                               if (adsException)
                               {
                                   if (!adsException.allow)
                                   {
                                       hideSpecialBlocks(request.specSocialBlocks[i]);
                                   }
                               }
                               else if (ads_enabled == "true"){
                                   hideSpecialBlocks(request.specSocialBlocks[i]);
                               }
                           }
                        }
                    }
                }
            }
        });

        document.addEventListener('click', function(e)
        {
             var event = e || window.event;
             var target = event.target || event.srcElement;

             if (target.id == "drwebConfirmation")
             {
                var box = document.getElementById("drwebConfirmation");
                if(box)
                {
                    box.parentNode.removeChild(box);
                    box.style.display = "none";
                    box = null;
                }
             }
        });

        port = chrome.extension.connect();
        port.onDisconnect.addListener(function (event) {

        });