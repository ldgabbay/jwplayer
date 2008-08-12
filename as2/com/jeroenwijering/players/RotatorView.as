/**
* Rotator user interface View of the MCV cycle.
*
* @author	Jeroen Wijering
* @version	1.5
**/


import com.jeroenwijering.players.*;
import com.jeroenwijering.utils.ImageLoader;
import com.jeroenwijering.utils.Animations;
import flash.geom.Transform;
import flash.geom.ColorTransform;

class com.jeroenwijering.players.RotatorView extends AbstractView { 


	/** full width of the scrubbars **/
	private var currentItem:Number;
	/** clip that's currently active **/
	private var upClip:MovieClip;
	/** clip that's currently inactive **/
	private var downClip:MovieClip;
	/** boolean for whether to use the title display **/ 
	private var useTitle:Boolean;
	/** boolean to see if the transition is done **/
	private var transitionDone:Boolean = false;
	/** boolean to detect first run **/ 
	private var firstRun:Boolean = true;
	/** interval for hiding the display **/
	private var hideInt:Number;
	/** array with all transitions **/ 
	private var allTransitions:Array = new Array(
		"bgfade",
		"blocks",
		"bubbles",
		"circles",
		"fade",
		"flash",
		"fluids",
		"lines",
		"slowfade"
	);
	/** Dimensions of the display **/
	private var dims:Array;


	/** Constructor **/
	function RotatorView(ctr:AbstractController,cfg:Object,fed:Object) { 
		super(ctr,cfg,fed);
		dims = new Array(config['width'],config['height']);
		setColorsClicks();
		if(config["shownavigation"] == "true") {
			Mouse.addListener(this);
			Stage.addListener(this);
		}
	};


	/** Sets up visibility, sizes and colors of all display items **/
	private function setColorsClicks() {
		var ref = this;
		var tgt:MovieClip = config["clip"];
		tgt.button._width = dims[0];
		tgt.button._height = dims[1];
		if(config['overstretch']=='true' || config['overstretch']=='fit') {
			tgt.img1.bg._visible = tgt.img2.bg._visible = false;
		} else {
			tgt.img1.bg._width = tgt.img2.bg._width = dims[0];
			tgt.img1.bg._height = tgt.img2.bg._height = dims[1];
			tgt.img1.col = new Color(tgt.img1.bg);
			tgt.img1.col.setRGB(config["screencolor"]);
			tgt.img2.col = new Color(tgt.img2.bg);
			tgt.img2.col.setRGB(config["screencolor"]);
		}
		if(config["linkfromdisplay"] == "true") {
			tgt.button.onRelease = function() { 
				ref.sendEvent("getlink",ref.currentItem); 
			};
			tgt.playicon._visible = false;
		} else {
			tgt.button.onRelease = function() { 
				ref.sendEvent("next"); 
			};
		}
		tgt.img1.swapDepths(1);
		tgt.img2.swapDepths(2);
		tgt.playicon.swapDepths(4);
		tgt.activity.swapDepths(5);
		tgt.navigation.swapDepths(6);
		tgt.logo.swapDepths(7);
		tgt.playicon._x=tgt.activity._x = Math.round(dims[0]/2);
		tgt.playicon._y=tgt.activity._y = Math.round(dims[1]/2);
		if(config["logo"] != undefined) {
			var lll = new ImageLoader(tgt.logo,"none");
			lll.onLoadFinished = function() {
				ref.config['clip'].logo._x = ref.dims[0] -
					ref.config['clip'].logo._width -10;
				ref.config['clip'].logo._y = 10;
			};
			lll.loadImage(config["logo"]);
		}
		tgt = config["clip"].navigation;
		if (config["shownavigation"] == "true") {
			tgt._y = dims[1] - 40;
			tgt._x = dims[0]/2 - 50;
			tgt.prevBtn.col1 = new Color(tgt.prevBtn.bck);
			tgt.prevBtn.col1.setRGB(config["backcolor"]);
			tgt.prevBtn.col2 = new Color(tgt.prevBtn.icn);
			tgt.prevBtn.col2.setRGB(config["frontcolor"]);
			tgt.itmBtn.col1 = new Color(tgt.itmBtn.bck);
			tgt.itmBtn.col1.setRGB(config["backcolor"]);
			tgt.itmBtn.txt.textColor = config["frontcolor"];
			tgt.nextBtn.col1 = new Color(tgt.nextBtn.bck);
			tgt.nextBtn.col1.setRGB(config["backcolor"]);
			tgt.nextBtn.col2 = new Color(tgt.nextBtn.icn);
			tgt.nextBtn.col2.setRGB(config["frontcolor"]);
			tgt.prevBtn.onRollOver = tgt.nextBtn.onRollOver = function() { 
				this.col2.setRGB(ref.config["lightcolor"]);
			};
			tgt.prevBtn.onRollOut = tgt.nextBtn.onRollOut = function() { 
				this.col2.setRGB(ref.config["frontcolor"]);
			};
			tgt.itmBtn.onRollOver = function() {
				this.txt.textColor = ref.config["lightcolor"];
			};
			tgt.itmBtn.onRollOut = function() {
				this.txt.textColor = ref.config["frontcolor"];
			};
			tgt.prevBtn.onRelease = function() { 
				ref.sendEvent("prev");
				this.col2.setRGB(ref.config["frontcolor"]);
			};
			tgt.itmBtn.onRelease = function() { ref.sendEvent("playpause"); };
			tgt.nextBtn.onRelease = function() { 
				ref.sendEvent("next");
				this.col2.setRGB(ref.config["frontcolor"]);
			};
			// set sizes, colors and buttons for image title
			var len = 0;
			for(var i=0; i<feeder.feed.length; i++) {
				if(feeder.feed[i]['title'] != undefined && 
					feeder.feed[i]['title'].length > len) {
					len = feeder.feed[i]['title'].length;
				} 
			}
			if(len == 0) {
				useTitle = false; 
				tgt.titleBtn._visible = false;
			} else {
				useTitle = true;
				tgt.titleBtn._x = 74;
				tgt.titleBtn.col1 = new Color(tgt.titleBtn.left);
				tgt.titleBtn.col1.setRGB(config["backcolor"]);
				tgt.titleBtn.col2 = new Color(tgt.titleBtn.mid);
				tgt.titleBtn.col2.setRGB(config["backcolor"]);
				tgt.titleBtn.col3 = new Color(tgt.titleBtn.right);
				tgt.titleBtn.col3.setRGB(config["backcolor"]);
				tgt.titleBtn.tf._width = len*6;
				tgt.titleBtn.tf.textColor = config["frontcolor"];
				if(feeder.feed[0]["link"] != undefined) {
					tgt.titleBtn.onRollOver = function() {
						this.tf.textColor = ref.config["lightcolor"];
					};
					tgt.titleBtn.onRollOut = function() {
						this.tf.textColor = ref.config["frontcolor"];
					};
					tgt.titleBtn.onRelease = function() {
						ref.sendEvent("getlink",ref.currentItem);
					};
				};
				tgt.titleBtn.mid._width = len*6;
				tgt.titleBtn.right._x = len*6+4;
				tgt.nextBtn._x = len*6 + 79;
			}
			if(feeder.audio == true) {
				tgt.audioBtn.col1 = new Color(tgt.audioBtn.bck);
				tgt.audioBtn.col2 = new Color(tgt.audioBtn.icnOn);
				tgt.audioBtn.col3 = new Color(tgt.audioBtn.icnOff);
				tgt.audioBtn.col1.setRGB(config["backcolor"]);
				tgt.audioBtn.col2.setRGB(config["frontcolor"]);
				tgt.audioBtn.col3.setRGB(config["frontcolor"]);
				tgt.audioBtn.onRollOver = function() {
					this.col2.setRGB(ref.config["lightcolor"]);
					this.col3.setRGB(ref.config["lightcolor"]);
				};
				tgt.audioBtn.onRollOut = function() {
					this.col2.setRGB(ref.config["frontcolor"]);
					this.col3.setRGB(ref.config["frontcolor"]);
				};
				tgt.audioBtn.onRelease = function() {
					ref.sendEvent("audio");
					this.col2.setRGB(ref.config["frontcolor"]);
					this.col3.setRGB(ref.config["frontcolor"]);
				};
				if(config['useaudio'] == "true") {
					tgt.audioBtn.icnOff._visible = false;
				} else {
					tgt.audioBtn.icnOn._visible = false;
				}
				tgt.audioBtn._x = len*6 + 104;
			} else {
				tgt.audioBtn._x = 0;
				tgt.audioBtn._visible = false;
			}
			
			if(Stage["displayState"] == "normal" && config["usefullscreen"] == "true") {
				tgt.fullscreenBtn.col1 = new Color(tgt.fullscreenBtn.bck);
				tgt.fullscreenBtn.col2 = new Color(tgt.fullscreenBtn.icnOn);
				tgt.fullscreenBtn.col3 = new Color(tgt.fullscreenBtn.icnOff);
				tgt.fullscreenBtn.col1.setRGB(config["backcolor"]);
				tgt.fullscreenBtn.col2.setRGB(config["frontcolor"]);
				tgt.fullscreenBtn.col3.setRGB(config["frontcolor"]);
				tgt.fullscreenBtn.onRollOver = function() {
					this.col2.setRGB(ref.config["lightcolor"]);
					this.col3.setRGB(ref.config["lightcolor"]);
				};
				tgt.fullscreenBtn.onRollOut = function() {
					this.col2.setRGB(ref.config["frontcolor"]);
					this.col3.setRGB(ref.config["frontcolor"]);
				};
				tgt.fullscreenBtn.onRelease = function() {
					ref.sendEvent("fullscreen");
					this.col2.setRGB(ref.config["frontcolor"]);
					this.col3.setRGB(ref.config["frontcolor"]);
				};
				tgt.fullscreenBtn.icnOff._visible = false;
				if(feeder.audio == true) {
					tgt.fullscreenBtn._x = len*6 + 130;
				} else {
					tgt.fullscreenBtn._x = len*6 + 104;
				}
			} else {
				tgt.fullscreenBtn._x = 0;
				tgt.fullscreenBtn._visible = false;
			}
			tgt._x = Math.round(dims[0]/2 - tgt._width/2);
		} else {
			tgt._visible = false;
		}
	};


	/** New item: switch clips and ready transition **/
	private function setItem(pr1) {
		currentItem = pr1;
		transitionDone = false;
		var tgt = config["clip"];
		tgt.navigation.itmBtn.txt.text = (currentItem+1) + " / " + 
			feeder.feed.length;
		if (useTitle == true) {
			tgt.navigation.titleBtn.tf.text=feeder.feed[currentItem]["title"];
		}
		tgt.img1.swapDepths(tgt.img2);
		downClip = upClip;
		if (upClip == tgt.img1) {
			upClip = tgt.img2;
		} else {
			upClip = tgt.img1;
		}
	};


	/** State switch; start the transition **/
	private function setState(stt:Number) {
		switch(stt) {
			case 0:
				if(config["showicons"] == "true") {
					config["clip"].playicon._visible = true;
				}
				config["clip"].activity._visible = false;
				break;
			case 1:
				config["clip"].playicon._visible = false;
				if(config["showicons"] == "true") {
					config["clip"].activity._visible = true;
				}
				break;
			case 2:
				config["clip"].playicon._visible = false;
				config["clip"].activity._visible = false;
				if(transitionDone == false) {
					doTransition();
					if(config["kenburns"] == "true") {
						moveClip();
					}
				}
				break;
		}
	};


	/** (Re)set the ken burns fade **/
	private function moveClip() {
		var dir = random(4);
		var clp = upClip.smc;
		if(upClip.smc == undefined) { clp = upClip.mc; }
		clp._xscale *= config['rotatetime']/20 + 1;
		clp._yscale *= config['rotatetime']/20 + 1;
		if(dir == 0) { 
			clp._x = 0;
		} else if (dir == 1) {
			clp._y = 0;
		} else if (dir == 2) {
			clp._x = dims[0] - upClip._width;
		} else {
			clp._y = dims[1] - upClip._height;
		}
		clp.onEnterFrame = function() {
			if(dir == 0) {
				this._x -= 0.3;
			} else if (dir == 1) {
				this._y -= 0.3;
			} else if (dir == 2) {
				this._x += 0.3;
			} else {
				this._y += 0.3;
			}
		};
	};


	/** Start a transition **/
	private function doTransition() {
		transitionDone = true;
		if(firstRun == true) {
			config["clip"].img1._alpha = 100;
			config["clip"].img2._alpha = 0;
			firstRun = false;
		} else {
			var trs = config["transition"];
			if(trs == "random") {
				trs = allTransitions[random(allTransitions.length)];
			}
			switch (trs) {
				case "bgfade":
					doBGFade();
					break;
				case "blocks":
					doBlocks();
					break;
				case "bubbles":
					doBubbles();
					break;
				case "circles":
					doCircles();
					break;
				case "fade":
					doFade();
					break;
				case "flash":
					doFlash();
					break;
				case "fluids":
					doFluids();
					break;
				case "lines":
					doLines();
					break;
				case "slowfade":
					doSlowfade();
					break;
				default:
					doFade();
					break;
			}
		}
	};


	/** Function for the fade transition **/
	private function doFade() {
		upClip.ref = this;
		upClip._alpha = 0;
		upClip.onEnterFrame = function() {
			this._alpha +=5;
			if(this._alpha >= 100) {
				delete this.onEnterFrame;
				this.ref.downClip._alpha = 0;
			}
		};
	};


	/** Function for the bgfade transition **/
	private function doBGFade() {
		downClip.ref = upClip.ref = this;
		downClip.onEnterFrame = function() {
			this._alpha -=5;
			if(this._alpha <= 0) {
				delete this.onEnterFrame;
				this.ref.upClip.onEnterFrame = function() {
					if(this._alpha >= 100) {
						delete this.onEnterFrame;
					} else {
						this._alpha +=5;
					}
				};
			}
		};
	};


	/** Function for the blocks transition **/
	private function doBlocks() {
		upClip._alpha = 100;
		config["clip"].attachMovie("blocksMask","mask",3);
		var msk:MovieClip = config["clip"].mask;
		if (dims[0] > dims[1]) {
			msk._width = msk._height = dims[0];
		} else {
			msk._width = msk._height = dims[1];
		}
		msk._rotation = random(4)*90;
		msk._rotation == 90 ? msk._x = dims[0]: null;
		msk._rotation == 180 ? msk._x = dims[0]: null;
		msk._rotation == 180 ? msk._y = dims[1]: null;
		msk._rotation == -90 ? msk._y = dims[1]: null;
		upClip.setMask(msk);
		playClip(msk);
	}; 


	/** Function for the bubbles transition **/
	private function doBubbles() {
		upClip._alpha = 100;
		config["clip"].attachMovie("bubblesMask","mask",3);
		var msk:MovieClip = config["clip"].mask;
		upClip.setMask(msk);
		if (dims[0] > dims[1]) {
			msk._width = msk._height = dims[0];
			msk._y = dims[1]/2 - msk._height/2;
		} else {
			msk._width = msk._height = dims[1];
			msk._x = dims[0]/2- msk._width/2;
		}
		if(random(2) == 1) { 
			msk._xscale = -msk._xscale; 
			msk._x += dims[0]; 
		}
		playClip(msk);
	};


	/** Function for the circles transition **/
	private function doCircles() {
		upClip._alpha = 100;
		config["clip"].attachMovie("circlesMask","mask",3);
		var msk:MovieClip = config["clip"].mask;
		upClip.setMask(msk);
		if (dims[0] > dims[1]) {
			msk._width = msk._height = dims[0];
		} else {
			msk._width = msk._height = dims[1];
		}
		msk._x = dims[0]/2;
		msk._y = dims[1]/2;
		playClip(msk,10);
	};


	/** Function for the flash transition **/
	private function doFlash() {
		upClip._alpha = 100;
		upClip.col = new Color(upClip);
		upClip.ctf = new Object({rb:255,gb:255,bb:255});
		upClip.col.setTransform(upClip.ctf);
		upClip.onEnterFrame = function() {
			if(this.ctf.rb < 1) {
				this.ctf =  new Object({rb:0,gb:0,bb:0});
				this.col.setTransform(this.ctf);
				delete this.onEnterFrame;
			} else {
				this.ctf.rb /= 1.05;
				this.ctf.gb /= 1.05;
				this.ctf.bb /= 1.05;
				this.col.setTransform(this.ctf);
			}
		};
	};

	/** Function for the fluids transition **/
	private function doFluids() {
		upClip._alpha = 100;
		config["clip"].attachMovie("fluidsMask","mask",3);
		var msk:MovieClip = config["clip"].mask;
		upClip.setMask(msk);
		msk._width = dims[0];
		msk._height = dims[1];
		playClip(msk);
	};


	/** Function for the lines transition **/
	private function doLines() {
		upClip._alpha = 100;
		config["clip"].attachMovie("linesMask","mask",3);
		var msk:MovieClip = config["clip"].mask;
		upClip.setMask(msk);
		msk._width = dims[0];
		msk._height = dims[1];
		playClip(msk);
	};


	/** Function for the fade transition **/
	private function doSlowfade() {
		upClip.ref = this;
		upClip._alpha = 0;
		upClip.onEnterFrame = function() {
			this._alpha+=2;
			if(this._alpha >= 100) {
				delete this.onEnterFrame;
				this.ref.downClip._alpha = 0;
			}
		};
	};


	/** Play a specific Movieclip and remove it once it's finished **/
	private function playClip(tgt:MovieClip,rot:Number) {
		tgt.ref = this;
		tgt.onEnterFrame = function() {
			this.nextFrame();
			rot == undefined ? null: this._rotation +=rot;
			if(this._currentframe  == this._totalframes) {
				this.ref.downClip._alpha = 0;
				this.clear();
				this.unloadMovie();
				this.removeMovieClip();
			}
		};
	};


	/** after a delay, the controlbar is hidden **/
	private function hideBar() {
		Animations.fadeOut(config['clip'].navigation);
		clearInterval(hideInt);
	}


	/** Mouse move shows controlbar **/
	public function onMouseMove() {
		Animations.fadeIn(config['clip'].navigation);
		clearInterval(hideInt);
		if(!config["clip"].navigation.hitTest(_root._xmouse,_root._ymouse)) {
			hideInt = setInterval(this,"hideBar",500);
		}
	};


	/** Catches fullscreen escape  **/
	public function onFullScreen(fs:Boolean) {
		if(fs == false) {
			dims = new Array(config['width'],config['height']);
		} else {
			dims = new Array(Stage.width,Stage.height);
		}
		config["clip"].navigation.fullscreenBtn.icnOn._visible = !fs;
		config["clip"].navigation.fullscreenBtn.icnOff._visible = fs;
		setDimensions();
		sendEvent('playitem',currentItem);
	};

	/** Resize after a fullscreen enter/leave **/
	private function setDimensions() {
		var tgt:MovieClip = config["clip"];
		tgt.button._width = tgt.img1.bg._width = tgt.img2.bg._width = dims[0];
		tgt.button._height = tgt.img1.bg._height = tgt.img2.bg._height = dims[1];
		tgt.playicon._x = tgt.activity._x = Math.round(dims[0]/2);
		tgt.playicon._y = tgt.activity._y = Math.round(dims[1]/2);
		tgt.logo._x = dims[0] - tgt.logo._width -10;
		if (config["shownavigation"] == "true") {
			tgt.navigation._y = dims[1] - 40;
			tgt.navigation._x = Math.round(dims[0]/2-tgt.navigation._width/2);
		}
	};


}