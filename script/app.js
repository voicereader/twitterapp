YUI().use(
    'base',
    'node',
    'anim',
    'event-touch',
    'transition',
    function (Y) {
        console.log('Hello world');

        /*App Literal Object*/
        var App = {};

        //Constans
        var WElCOME_MESSAGE = 'Welcome, to the twitter reader demo',
            HIDDEN_CLASS = 'hidden',
            TWITTER_TIMELINE_CLASS = '.twitter-timeline',
            NAVBAR_BOTTOM_CLASS = '.navbar-bottom',
            SLIDER_BOTTOMBAR_CLASS = 'slide-bottonbar-show';


        /**
         * Description
         * @method init
         * @return
         */
        App.init = function () {
            //Check for TTS suporting
            if (window.SpeechSynthesisUtterance) {
                window.speechSynthesis.cancel();
                App.speechSynthesisUtteranceMsg = new window.SpeechSynthesisUtterance();

                //ATTRS
                App.lastTweetCollectionSize = 0;

                App.actualTweetNode = null;

                App.lastTweetReadedIndex = 0;

                //Call twitter API timeline
                App.twitterLoadAction();

                //Welcome message
                App.listenReadVoice.call(App, WElCOME_MESSAGE, function () {
                    //console.log('Ha terminado de hablar');
                });
            } else {
                App.showNotSupportedBrowserAction();
            }
        }

        /**
         * Show the Main Page Action
         * @method showMainPageAction
         * @return
         */
        App.showMainPageAction = function () {
            var navbarBottomNode = Y.one(NAVBAR_BOTTOM_CLASS),
                mainPageContainerNode = Y.one('.containerx');

            //Hidding the preloader bar node
            Y.all('.preloader-bar .preloader-chunk').each(function (item) {
                item.addClass('slide-up-trans');
            })
            Y.one('.preloader-bar').addClass(HIDDEN_CLASS);


            //Showing the bottom bar
            navbarBottomNode.removeClass(HIDDEN_CLASS);
            navbarBottomNode.addClass(SLIDER_BOTTOMBAR_CLASS);

            //Hidden landing page
            Y.one('.landing-page-container').transition({
                easing: 'ease-out',
                duration: 0.75, // seconds
                opacity: '0'
            }, function () {
                this.addClass(HIDDEN_CLASS);
                mainPageContainerNode.removeClass(HIDDEN_CLASS);
                mainPageContainerNode.transition({
                    easing: 'ease-out',
                    duration: 0.75, // seconds
                    opacity: '1'
                }, function () {});
            });
        }

        /**
         * Show not Supported Browser Wall
         * @method showNotSupportedBrowserAction
         * @return
         */
        App.showNotSupportedBrowserAction = function () {
            //Hidden Welcome Text
            Y.one('.text-hero').addClass(HIDDEN_CLASS);

            //Showing Not Supported browser
            Y.one('.non-supported-browser').removeClass(HIDDEN_CLASS);
        }


        /**
         * Settup Twitter timeline widget heigth with viewport
         * @method setupTwitterTimelineHelper
         * @return
         */
        App.setupTwitterTimelineHelper = function () {
            var twitterTimelineNode = Y.one(TWITTER_TIMELINE_CLASS),
                viewportHeigth = window.innerHeight - 60;
            twitterTimelineNode.setAttribute('height', viewportHeigth);
        }

        /**
         * Load Timeline Twitter Widget
         * @method twitterLoadAction
         * @return
         */
        App.twitterLoadAction = function () {
            App.setupTwitterTimelineHelper();
            ! function (d, s, id) {
                var js,
                    fjs = d.getElementsByTagName(s)[0],
                    p = /^http:/.test(d.location) ? 'http' : 'https';

                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "lib/twitter/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }
            }(document, "script", "twitter-wjs");

            //TODO: We migth to clear jquery code 
            //Small hack to know when twitter timeline widget is ready
            if ($(TWITTER_TIMELINE_CLASS).length) {
                //Timeline exists is it rendered ?
                interval_timeline = false;
                interval_timeline = setInterval(function () {
                    //console.log($(TWITTER_TIMELINE_CLASS).width());
                    if ($(TWITTER_TIMELINE_CLASS).hasClass('twitter-timeline-rendered')) {
                        if ($(TWITTER_TIMELINE_CLASS).width() > 10) {
                            clearInterval(interval_timeline);
                            //run when twitter widget is rendered
                            App.twitterOnLoadHandle();
                        }
                    }
                }, 200);
            }
        }

        /**
         * When twitter timeline has been loaded
         * @method twitterOnLoadHandle
         * @return
         */
        App.twitterOnLoadHandle = function () {

            //Take twitter iframe node
            App.iframeBodyNode = App.getIframeBodyNode();

            //Add custom css rules to twitter widget
            App.addCustomCss();

            //Put our render customization in a twitter widget
            App.initialRenderAction();

            //Setting listeners
            App.bindEvents();

            //Add hiden an showing navbar small behavior
            App.addBottomNavBarBehavior();

            //When all is ready we show the main page
            App.showMainPageAction();

        }

        /**
         * Add hide an show behavior to bottom bar, taking in account the load more tweets
         * @method addBottomNavBarBehavior
         * @return
         */
        App.addBottomNavBarBehavior = function () {
            //node scroll info setup
            var scrollNodeContainer = App.iframeBodyNode.one('.stream');

            scrollNodeContainer.on('scroll', function (e) {
                var currentTop = scrollNodeContainer.get('scrollTop'),
                    viewportHeigth = scrollNodeContainer.get('offsetHeight'),
                    elementTop = App.iframeBodyNode.one('button.load-more').get('offsetTop'),
                    visibleMargin = elementTop - viewportHeigth;

                var navbarBottomNode = Y.one(NAVBAR_BOTTOM_CLASS);

                if (visibleMargin <= currentTop) {
                    navbarBottomNode.removeClass(SLIDER_BOTTOMBAR_CLASS);
                    navbarBottomNode.addClass('slide-hide');
                } else {
                    navbarBottomNode.removeClass('slide-hide');
                    navbarBottomNode.addClass(SLIDER_BOTTOMBAR_CLASS);
                }
            });
        }

        /**
         * Play voice
         * @method listenReadVoice
         * @param {String} text
         * @param {function} callback
         * @return
         */
        App.listenReadVoice = function (text, callback) {
            console.log(text);

            /**
             * Is launch when current speak ends
             * TODO: Actually there are a several bug here
             * @method onend
             * @param {} e
             * @return
             */
            App.speechSynthesisUtteranceMsg.onend = function (e) {
                //console.log('Paro - 0');
                if (callback) {
                    callback();
                }

            }

            App.speechSynthesisUtteranceMsg.onstart = function (e) {
                //console.log('Hablo - 1');
            }

            //TODO: Sometimes speechSynthesis not end when finish
            window.speechSynthesis.cancel();

            App.speechSynthesisUtteranceMsg.text = text;
            window.speechSynthesis.speak(App.speechSynthesisUtteranceMsg);
        }

        /**
         * Add Custom CSS to twitter iframe
         * @method addCustomCss
         * @return
         */
        App.addCustomCss = function () {
            //Agregando custom css to the iframe
            var cssLink = document.createElement("link");

            //TODO: Clean HardCode Values
            cssLink.href = "assets/styles/twitteriframe.css";
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css";

            //TODO: This aproach has a firefox problems
            frames['twitter-widget-0'].document.body.appendChild(cssLink);
        }

        /**
         * Return Iframe twitter widget body node
         * @method getIframeBodyNode
         * @return bodyNode
         */
        App.getIframeBodyNode = function () {
            var frame = Y.one('iframe'),
                iframeDocument = frame.get('contentWindow').get('document'),
                bodyNode;

            bodyNode = iframeDocument.one('body');

            return bodyNode;
        }

        /**
         * Listeners setup
         * @method bindEvents
         * @return
         */
        App.bindEvents = function () {

            //Evento que se dispara cuando se cargan more tweets
            twttr.events.bind('loadMore', function (event) {
                App.loadMoreAction();
            });

            //Is fired when new tweets comming
            twttr.events.bind('newTweets', function (event) {
                App.newTweetsAction();
            });

            //Sharing behaviors
            App.bindSharingEvents();

            //Hover behavior in touch devices
            var touchHoverableNodesSelector = [
                '.navbar-bottom .previous',
                '.navbar-bottom .next',
                '.navbar-bottom .rewind'
            ];

            Y.each(touchHoverableNodesSelector, function (item) {
                Y.one(item).on('touchstart', function (e) {
                    var node = e.currentTarget;
                    node.addClass('touch-hover');
                    node.once('touchend', function (e) {
                        node.removeClass('touch-hover');
                    });
                });
            });

            //Especific hover touch behavior for share button
            Y.one('.topbar .share').on('touchstart', function (e) {
                var node = e.currentTarget;
                node.addClass('touch-hover-image');
                node.once('touchend', function (e) {
                    node.removeClass('touch-hover-image');
                });
            });

            //Click actions
            Y.one('.navbar-bottom .next').on('click', App.readNextTweetAction);
            Y.one('.navbar-bottom .previous').on('click', App.readPreviousTweetAction);
            Y.one('.navbar-bottom .rewind').on('click', App.readInitialTweetAction);
            Y.one('.topbar .share').on('click', function () {
                $('#myModal').modal('show');
            });
        }

        /**
         * Bind Share Actions to Modal
         * @method bindSharingEvents
         * @return
         */
        App.bindSharingEvents = function () {
            var bodyNode = App.iframeBodyNode,
                modalBodyNode = Y.one('.modal-body'),
                shareItemNodeCollection = modalBodyNode.all('.list-group-item');

            shareItemNodeCollection.each(function (item) {
                item.on('click', function (e) {
                    var shareBehavior = e.target.getAttribute('data-share');
                    App.shareAction(shareBehavior);
                    //jquery code
                    $('#myModal').modal('hide');
                })
            })

        }

        /**
         * Open a new tab to share
         * @method shareAction
         * @param {String} shareBehavior
         * @return
         */
        App.shareAction = function (shareBehavior) {
            var url = '';
            if (shareBehavior === 'feedback') {
                url = 'https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Flocalhost%2Ftwitterapp%2F&screen_name=dariel_noel';
            } else if (shareBehavior === 'twitter') {
                url = 'https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Flocalhost%2Ftwitterapp%2F&url=http%3A%2F%2Fvoicereader.github.io&text=How%20you%20can%20read%20tweets%20without%20reading?%20Take%20a%20look%20at%20';
            } else if (shareBehavior === 'googleplus') {
                url = 'https://plus.google.com/share?url=http%3A%2F%2Fvoicereader.github.io%2F'
            } else if (shareBehavior === 'facebook') {
                url = 'https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fvoicereader.github.io';
            }

            if (url !== '') {
                window.open(url, '_blank');
            }
        }

        /**
         * Put our custom render logic into the twitter widget
         * @method initialRenderAction
         * @return
         */
        App.initialRenderAction = function () {
            var bodyNode = App.iframeBodyNode;
            tweetActionCollection = bodyNode.all('.tweet-actions'),
            tweetCollectionSize = tweetActionCollection.size();

            for (var i = 0; i < tweetCollectionSize; i++) {
                App.addVoiceReadBehavior(tweetActionCollection.item(i));
            }

            App.lastTweetCollectionSize = tweetCollectionSize;
        }

        /**
         * Is launched when more tweets is comming
         * @method loadMoreAction
         * @return
         */
        App.loadMoreAction = function () {
            var bodyNode = App.iframeBodyNode,
                tweetActionCollection = bodyNode.all('.tweet-actions'),
                tweetCollectionSize = tweetActionCollection.size(),
                lastTweetCollectionSize = App.lastTweetCollectionSize;

            for (var i = lastTweetCollectionSize; i < tweetCollectionSize; i++) {
                App.addVoiceReadBehavior(tweetActionCollection.item(i));
            }
            App.lastTweetCollectionSize = tweetCollectionSize;
        }

        /**
         * Is launched when new tweets is comming
         * @method newTweetsAction
         * @return
         */
        App.newTweetsAction = function () {
            var bodyNode = App.iframeBodyNode,
                tweetActionCollection = bodyNode.all('.tweet-actions'),
                tweetCollectionSize = tweetActionCollection.size(),
                lastTweetCollectionSize = App.lastTweetCollectionSize,
                size = tweetCollectionSize - lastTweetCollectionSize;

            for (var i = 0; i < size; i++) {
                App.addVoiceReadBehavior(tweetActionCollection.item(i));
            }

            App.lastTweetCollectionSize = tweetCollectionSize;
        }

        /**
         * Add voice read render and bind behavior to the existing widget
         * @method addVoiceReadBehavior
         * @param {Node} tweetActionNode
         * @return
         */
        App.addVoiceReadBehavior = function (tweetActionNode) {
            var voiceReadHTMLMarkup = '<li class="voice-read-tweet"><a><i class="ic-mask ic-con"></i></a><b>Reply</b></li>',
                voiceReadNode = Y.Node.create(voiceReadHTMLMarkup);

            tweetActionNode.appendChild(voiceReadNode);
            voiceReadNode.on('click', App.voiceReadNodeClickHandle);

        }

        /**
         * Read Node Click handle
         * @method voiceReadNodeClickHandle
         * @param {} e
         * @return
         */
        App.voiceReadNodeClickHandle = function (e) {
            var tweetNode = e.currentTarget.get('parentNode').get('parentNode').get('parentNode');
            e.stopPropagation();
            App.readTweetHelper.call(this, tweetNode, function (e) {});
        }

        /**
         * Return a Tweet Node by Render
         * @method getTweetByIndexHelper
         * @param {} index
         * @return tweetNode
         */
        App.getTweetByIndexHelper = function (index) {
            var iframeBodyNode = App.iframeBodyNode,
                tweetCollectionNodeContainer = iframeBodyNode.one('.stream ol'),
                tweetCollectionNode = tweetCollectionNodeContainer.get('children'),
                tweetCollectionNodeSize = tweetCollectionNode.size(),
                tweetNode;

            if (index >= 0 && index < tweetCollectionNodeSize) {
                tweetNode = tweetCollectionNode.item(index);
            }

            return tweetNode;
        }

        /**
         * Read the last incomming tweet
         * @method readInitialTweetAction
         * @return
         */
        App.readInitialTweetAction = function () {
            var actualTweetNode = App.actualTweetNode,
                initialTweetNode;

            initialTweetNode = App.getTweetByIndexHelper(0);
            App.scrollToHelper(initialTweetNode);

            App.readTweetHelper(initialTweetNode, function () {
                //console.log('es ejecutado');
            });

        }

        /**
         * Read Next Tweet
         * @method readNextTweetAction
         * @return
         */
        App.readNextTweetAction = function () {
            var actualTweetNode = App.actualTweetNode,
                nextTweetNode;

            if (actualTweetNode) {
                nextTweetNode = actualTweetNode.get('nextSibling').get('nextSibling');
                if (nextTweetNode.getAttribute('data-scribe') !== 'component:tweet') {
                    //Es el ultimo y debe comenzar por el principio
                    nextTweetNode = App.getTweetByIndexHelper(0);
                }

            } else {
                //Se comienza por el 0
                nextTweetNode = App.getTweetByIndexHelper(0);

            }
            //Scroll to the top of the viewport
            App.scrollToHelper(nextTweetNode);

            App.readTweetHelper(nextTweetNode, function () {
                //console.log('es ejecutado');
            });

        }

        /**
         * Read Previous Tweet
         * @method readPreviousTweetAction
         * @param {} e
         * @return
         */
        App.readPreviousTweetAction = function (e) {
            var actualTweetNode = App.actualTweetNode,
                previousTweetNode,
                clickNode = e.currentTarget;


            if (actualTweetNode) {
                previousTweetNode = actualTweetNode.get('previousSibling').get('previousSibling');
                if (!previousTweetNode || previousTweetNode.getAttribute('data-scribe') !== 'component:tweet') {
                    //Es el ultimo y debe comenzar por el principio
                    previousTweetNode = App.getTweetByIndexHelper(0);
                }

            } else {
                //Se comienza por el 0\
                previousTweetNode = App.getTweetByIndexHelper(0);
            }

            //Agarro el nodo y srolleo hasta la parte superior
            App.scrollToHelper(previousTweetNode);

            App.readTweetHelper(previousTweetNode, function () {
                //console.log('es ejecutado');
            });

        }

        /**
         * Scroll Tweet to the viewport top
         * @method scrollToHelper
         * @param {Node} tweetNode
         * @return
         */
        App.scrollToHelper = function (tweetNode) {
            var scrollNodeContainer = App.iframeBodyNode.one('.stream'),
                currentTop = scrollNodeContainer.get('scrollTop'),
                elementTop = tweetNode.get('offsetTop'),
                scrollAnim;

            scrollAnim = new Y.Anim({
                node: scrollNodeContainer,
                to: {
                    scrollTop: elementTop
                },
                duration: 0.5,
            });

            scrollAnim.run();
        }

        /**
         * Alloy to read a tweet node
         * @method readTweetHelper
         * @param {} tweetNode
         * @param {} callback
         * @return
         */
        App.readTweetHelper = function (tweetNode, callback) {
            var tweetInnerTextNode = tweetNode.one('.e-entry-content .e-entry-title'),
                tweetText = '',
                cloneNode,
                linkNodeCollection,
                hrefAttribute,
                textSubtitution;

            //Buscar la pocision de este elemento dentro de la lista


            //A partir de aqui vamos a trabajar con una copia del nodo para no modificar la visualizacion
            cloneNode = tweetInnerTextNode.cloneNode(true);

            //We need to clean all a nodes
            linkNodeCollection = cloneNode.all('a');

            linkNodeCollection.each(function (linkNode) {
                //Limpiamos el link node a un formato entendible
                App.clearLinkNode(linkNode);
            });

            //Borro el nodo anterior
            App.clearActualTweetNodeHelper();

            //Cojo la barrita,
            var actionBar = tweetNode.one('.tweet-actions'),
                voiceRead = tweetNode.one('.voice-read-tweet i');

            //la pongo visible
            actionBar.addClass('show-helper');

            //Se marca de azul la bocinita
            voiceRead.addClass('ic-reading');

            //Guardo el nodo actual para poder cancelarle las cosas
            App.actualTweetNode = tweetNode;

            App.listenReadVoice(cloneNode.get('text'), callback);


        }

        /**
         * Clear the actual tweet node after reading
         * @method clearActualTweetNodeHelper
         * @return
         */
        App.clearActualTweetNodeHelper = function () {
            var tweetNode = App.actualTweetNode;

            if (tweetNode) {
                //Cojo la barrita,
                var actionBar = tweetNode.one('.tweet-actions'),
                    voiceRead = tweetNode.one('.voice-read-tweet i');

                //la pongo visible
                actionBar.removeClass('show-helper');

                //Se le quita la animacion
                voiceRead.removeClass('ic-reading');

                //Se deja azul la bocinita
                voiceRead.addClass('ic-readed');
            }


        }

        /**
         * Some smart logic to read links
         * @method clearLinkNode
         * @param {} linkNode
         * @return
         */
        App.clearLinkNode = function (linkNode) {
            //TODO: Es necesario validar todos los casos
            //- #hashtags
            //- @mentions
            //- normal links

            var textSubtitution = '',
                dataScribeAttribute = linkNode.getAttribute('data-scribe');

            //- @mentions
            if (dataScribeAttribute === 'element:mention') {
                textSubtitution = linkNode.get('text');
            } //- #hashtags
            else if (dataScribeAttribute === 'element:hashtag') {
                textSubtitution = linkNode.get('text');
            } //- normal links
            else if (dataScribeAttribute === 'element:url') {
                var hrefAttribute = linkNode.getAttribute('data-expanded-url');
                if (hrefAttribute) {
                    textSubtitution = App.clearUrlHelper(hrefAttribute, '');
                    textSubtitution = ', ' + App.getLinkReadMoreMessageHelper() + ' ' + textSubtitution;
                } else {
                    textSubtitution = '';
                }
            }

            //Creamos el nodo
            var clearedLinkNode = Y.Node.create("<span>" + textSubtitution + "</span>");

            //Reemplazamos el nodo por el nuestro
            linkNode.replace(clearedLinkNode);
        }

        /**
         * Clear ugly charts from url
         * @method clearUrlHelper
         * @param {} url
         * @param {} replace
         * @return clearedUrl
         */
        App.clearUrlHelper = function (url, replace) {
            var clearedUrl = url.replace(new RegExp(/\b(https?|ftp|file):\/\/(www.)?/), replace);
            clearedUrl = clearedUrl.split('/')[0];
            return clearedUrl;
        }

        /**
         * Amazing Read more messages
         * @method getLinkReadMoreMessageHelper
         * @return MemberExpression
         */
        App.getLinkReadMoreMessageHelper = function () {
            var readMoreMessageCollection = APP_CONFIG.readMoreMessageCollection,
                readMoreMessageCollectionSize = readMoreMessageCollection.length,
                readMoreMessage = '',
                randomMessageIndex = App.ramdomizeHelper(0, readMoreMessageCollectionSize - 1);

            return readMoreMessageCollection[randomMessageIndex];

        }

        /**
         * Random number between a and b
         * @method ramdomizeHelper
         * @param {int} a
         * @param {int} b
         * @return random
         */
        App.ramdomizeHelper = function (a, b) {
            var random;
            b++;
            random = Math.floor(Math.random() * (b - a)) + a;

            return random;
        }

        //The latest three methods will be implemented in a near feature

        /**
         * Description
         * @method startReadTweetCollectionAction
         * @return
         */
        App.startReadTweetCollectionAction = function () {
            var lastTweetReadedIndex = App.lastTweetReadedIndex;

            if (lastTweetReadedIndex > 0) {
                //Preguntar si se quieren escuchar desde el principio
            } else {
                //Escuchar a partir de 
                App.readTweetCollectionHelper(lastTweetReadedIndex);
            }
        }

        //Dado un index lee los tweets que estan de esa pocosicion hacia abajo
        /**
         * Description
         * @method readTweetCollectionHelper
         * @param {} readIndex
         * @return
         */
        App.readTweetCollectionHelper = function (readIndex) {
            var lastTweetCollectionSize = App.lastTweetCollectionSize;
            if (readIndex >= 0 && readIndex < lastTweetCollectionSize) {
                //Leo el tweet
                App.readTweetAction(readIndex, function () {
                    //console.log('Ejecutando callback');
                    App.lastTweetReadedIndex++;
                    App.readTweetCollectionHelper(App.lastTweetReadedIndex);
                })

            }
        }

        //Lee el tweet que se encuentra en la pocision readIndex
        /**
         * Description
         * @method readTweetAction
         * @param {} readIndex
         * @param {} callback
         * @return
         */
        App.readTweetAction = function (readIndex, callback) {
            var iframeBodyNode = App.iframeBodyNode,
                tweetCollectionNodeContainer = iframeBodyNode.one('.stream ol'),
                tweetCollectionNode = tweetCollectionNodeContainer.get('children'),
                tweetCollectionNodeSize = tweetCollectionNode.size();

            if (readIndex >= 0 && readIndex < tweetCollectionNodeSize) {
                //console.log(tweetCollectionNode.item(readIndex));
                App.readTweetHelper(tweetCollectionNode.item(readIndex), callback);
            }
        }

        //Init the aplication
        App.init();

    });