var settings = {
	/** Player versions to test. **/
	players: {
		'v5':'../trunk/fl5/player.swf',
		'5.2':'../tags/mediaplayer-5.2/player.swf',
		'5.1':'../tags/mediaplayer-5.1/player.swf',
		'5.0':'../tags/mediaplayer-5.0/player.swf',
		'4.7':'../trunk/as3/player.swf',
		'4.6':'../tags/mediaplayer-4.6/player.swf',
		'4.5':'../tags/mediaplayer-4.5/player.swf',
		'4.4':'../tags/mediaplayer-4.4/player.swf',
		'4.3':'../tags/mediaplayer-4.3/player.swf',
		'4.2':'../tags/mediaplayer-4.2/player.swf',
		'4.1':'../tags/mediaplayer-4.1/player.swf',
		'botr':'http://content.bitsontherun.com/staticfiles/videoplayer.swf'
	},
	/** Available plugins to test. **/
	plugins: {
		agegate:'../plugins/agegate/v5/agegate.swf',
		audiodescription:'../plugins/audiodescription/v4/audiodescription.swf',
		captions:'../plugins/captions/v4/captions.swf',
		hd:'../plugins/hd/v5/trunk/hd.swf',
		livestream:'../plugins/livestream/livestream.swf',
		metaviewer:'../plugins/metaviewer/metaviewer.swf',
		qualitymonitor:'../plugins/qualitymonitor/qualitymonitor.swf',
		revolt:'../plugins/revolt/revolt.swf',
		searchbar:'../plugins/searchbar/searchbar.swf',
		sharing:'../plugins/sharing/v5/sharing.swf'
	},
	/** Avaliable skins to test. **/
	skins: {
		'':' ',
		beelden:'../skins/beelden/beelden.xml',
		bekle:'../skins/bekle/bekle.xml',
		bluemetal:'../skins/bluemetal/bluemetal.xml',
		classic:'../skins/classic/classic.xml',
		five:'../skins/five/five.xml',
		glow:'../skins/glow/glow.xml',
		lulu:'../skins/lulu/lulu.xml',
		modieus:'../skins/modieus/modieus.xml',
		playcasso:'../skins/playcasso/playcasso.xml',
		snel:'../skins/snel/snel.xml',
		stijl:'../skins/stijl/stijl.xml',
        stormtrooper:'../skins/stormtrooper/stormtrooper.xml',
		' ':' ',
		bekle_swf:'../skins/bekle/bekle.swf',
		bluemetal_swf:'../skins/bluemetal/bluemetal.swf',
		classic_swf:'../skins/classic/classic.swf',
		five_swf:'../skins/five/five.swf',
		icecreamsneaka_swf:'../skins/icecreamsneaka/icecreamsneaka.swf',
		modieus_swf:'../skins/modieus/modieus.swf',
		playcasso_swf:'../skins/playcasso/playcasso.swf',
		snel_swf:'../skins/snel/snel.swf',
		stijl_swf:'../skins/stijl/stijl.swf'
	},
	/** All the setup examples with their flashvars. **/
	examples: {
		'': {},
		'FLV video': {
			file:'../../testing/files/bunny.flv',
			image:'files/bunny.jpg',
			height:240,
			width:400
		},
		'MP4 video': {
			file:'../../testing/files/bunny.mp4',
			image:'files/bunny.jpg',
			height:240,
			width:400
		},
		'MP3 audio': {
			file:'files/bunny.mp3',
			height:24,
			width:400
		},
		'AAC audio':{
			file:'../../testing/files/bunny.m4a',
			image:'files/bunny.jpg',
			height:240,
			width:400
		},
		'JPG image': {
			file:'files/bunny.jpg',
			height:240,
			width:400
		},
		'Youtube video': {
			file: 'http://youtube.com/watch?v=IBTE-RoMsvw',
			height: 240,
			width: 400
		},
		' ': {},
		'HTTP streamed FLV': {
			file:'http://content.bitsontherun.com/videos/Qvxp3Jnv-68183.flv',
			provider:'http',
			height:240,
			width:400,
			'http.startparam':'apstart'
		},
		'HTTP streamed MP4': {
			file:'http://content.bitsontherun.com/videos/Qvxp3Jnv-483.mp4',
			provider:'http',
			height:240,
			width:400,
			'http.startparam':'starttime'
		},
		'HTTP bitrate switching': {
			file:'files/bitrates.xml',
			height:240,
			width:400,
			plugins:'qualitymonitor'
		},
		'RTMP streamed FLV': {
			file:'videos/Qvxp3Jnv-68183.flv',
			streamer:'rtmp://fms.12E5.edgecastcdn.net/0012E5',
			height:240,
			width:400
		},
		'RTMP streamed MP4': {
			file:'videos/Qvxp3Jnv-483.mp4',
			streamer:'rtmp://fms.12E5.edgecastcdn.net/0012E5',
			height:240,
			width:400
		},
		'RTMP dynamic stream': {
			file:'files/dynamic.xml',
			height:240,
			width:500,
			plugins:'qualitymonitor'
		},
		'RTMP live stream (not always on)': {
			file:'isight',
			streamer:'rtmp://fml.dca.12E5.edgecastcdn.net/2012E5/',
			height:240,
			width:500,
			plugins:'qualitymonitor'
		},
		'  ':{},
		'ASX playlist': {
			file:'files/asx.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'ATOM playlist': {
			file:'files/atom.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'iRSS playlist': {
			file:'files/irss.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'mRSS playlist': {
			file:'files/mrss.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'SMIL playlist': {
			file:'files/smil.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'XSPF playlist': {
			file:'files/xspf.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400
		},
		'   ': {},
		'Highwinds dynamic stream': {
			file:'files/highwinds.xml',
			height:240,
			width:500,
			plugins:'qualitymonitor'
		},
		'CloudFront playlist': {
			file:'files/cloudfront.xml',
			height:240,
			width:800,
			playlist:'right',
			playlistsize:400,
			plugins:'qualitymonitor'
		},
		'    ': {},
		'Agegate plugin': {
			file:'../../testing/files/corrie.flv',
			height:240,
			width:500,
			plugins:'agegate',
			'agegate.minage':18
		},
		'Audiodescription and captions plugins': {
			file:'../../testing/files/corrie.flv',
			height:240,
			width:500,
			plugins:'audiodescription,captions',
			'audiodescription.file':'files/corrie.mp3',
			'captions.file':'files/corrie.xml'
		},
		'Audiodescription and captions plugins (2)': {
			file:'files/accessibility.xml',
			height:325,
			width:800,
			playlist:'right',
			playlistsize:260,
			volume:90,
			dock:false,
			plugins:'audiodescription,captions',
			'audiodescription.ducking':80,
			'audiodescription.debug':true,
			'captions.back':true,
			'captions.fontsize':18
		},
		'HD plugin': {
			file:'../../testing/files/bunny.flv',
			height:240,
			width:500,
			plugins:'hd',
			dock:'true',
			'hd.file':'../../testing/files/bunny.mp4'
		},
		'Searchbar plugin': {
			file:'http://gdata.youtube.com/feeds/api/standardfeeds/recently_featured?v=2',
			playlist:'over',
			height:260,
			width:460,
			plugins:'searchbar',
			'searchbar.script': 'http://gdata.youtube.com/feeds/api/videos?vq=QUERY&format=5'
		},
		'Sharing plugin': {
			dock:true,
			file:'../../testing/files/bunny.flv',
			height:260,
			width:460,
			plugins:'sharing',
			'sharing.code':'%3Cembed%20src%3D%22http%3A%2F%2Fcontent.bitsontherun.com%2Fplayers%2FnPripu9l-1754.swf%22%20width%3D%22400%22%20height%3D%22250%22%20allowscriptaccess%3D%22always%22%20%2F%3E',
			'sharing.link':'http://www.bigbuckbunny.org/'
		},
		'     ': {},
		'Default skin with different colors': {
			file:'files/mrss.xml',
			height:300,
			width:500,
			controlbar: 'over',
			playlist:'bottom',
			playlistsize:'50pct',
			backcolor:'333333',
			frontcolor:'CCCCCC',
			lightcolor:'77AA22',
			screencolor:'FFFFFF'
		},
		'Different skin with HD playlist': {
			file:'files/hd.xml',
			height:240,
			width:800,
			controlbar:'over',
			playlist:'right',
			playlistsize:400,
			skin:'beelden',
			plugins:'hd'
		},
		'Stretched, stacked and muted': {
			file:'files/mrss.xml',
			stretching:'fill',
			height:240,
			width:600,
			playlist:'over',
			controlbar:'over',
			mute:"true",
			playlistsize:400
		},
		'Loading from config xml': {
			config:'files/config.xml',
			height:240,
			width:500
		},
		'Start and duration flashvars': {
			file:'files/bunny.mp3',
			height:24,
			width:400,
			start:5,
			duration:15,
			repeat:'always',
			autostart:'true'
		}
	}
}
