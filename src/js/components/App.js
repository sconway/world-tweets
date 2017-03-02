import React, { Component }                         from 'react';
import ReactDOM                                     from 'react-dom'
import { scene, camera, renderer}                   from '../common/scene';
import { setEvents }                                from '../common/setEvents';
import { convertToXYZ, getEventCenter, geodecoder } from '../common/geoHelpers';
import { mapTexture }                               from '../common/mapTexture';
import { getTween, memoize, getColor }              from '../common/utils';
import { fadeObject }                               from '../utils/tweens';
import { createEarth }                              from '../utils/createEarth';
import { createPoint }                              from '../utils/createPoint';
import { pointList }                                from '../utils/createPoint';
import THREE                                        from 'THREE';
import d3                                           from 'd3';
import * as topojson                                from "topojson-client";

import CountryInformation                           from '../components/CountryInformation';
import CountryName                                  from '../components/CountryName';
import BackButton                                   from '../components/BackButton';
import TweetBox                                     from '../components/TweetBox';
import TweetCount                                   from '../components/TweetCount';

let OrbitControls     = require('three-orbit-controls')(THREE),
    io                = require('socket.io-client'),
    TWEEN             = require('tween.js'),
    geo, controls, countries, overlay, textureCache, 
    earth, cloud,
    root      = new THREE.Object3D(),
    points    = new THREE.Object3D(),
    clock     = new THREE.Clock();

const segments = 200, // number of vertices. Higher = better mouse accuracy
      RADIUS   = 400;

export var tweets = [];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      countryName: "",
      countryFlag: "us",
      countryCapital: "",
      countryPopulation: "",
      countrySize: "",
      countryLanguages: "",
      numTweets: 0,
      numCountryTweets: 0,
      isPointHovered: false,
      isCountryClicked: false,
      tweetImage: "src/images/clouds.png",
      tweetName: "",
      tweetText: ""
    }

    this.timer  = null;
    this.socket = null;
    this.globeMutex = true;
    this.countryData = null;
    this.sphere = new THREE.SphereGeometry(RADIUS, segments, segments); 
    this.mouseCoordinates  = {x: 0, y: 0};  
    this.lastPoint         = {};
    this.animate           = this.animate.bind(this);
    this.initFeed          = this.initFeed.bind(this);
    this.onGlobeClick      = this.onGlobeClick.bind(this);
    this.onGlobeMouseDown      = this.onGlobeMouseDown.bind(this);
    this.onGlobeMousemove  = this.onGlobeMousemove.bind(this);
  }


	/**
	 * Initializer function to set up our scene and all elements within it.
	 */
	init() {
	  this.animate();
	  this.loadMap();
	}


  /**
   * Creates the socket connection with the server, and uses the data that
   * is sent over to create the map points, text display, etc..
   */
  initFeed() {
    let self   = this;

    this.socket = io.connect();

    // when a new tweet comes in, add it to our array
    this.socket.on('tweet', (data) => {

      if (!self.state.isCountryClicked) {
        tweets.push(data);
      } else {
        self.setState({ numCountryTweets: self.state.numCountryTweets + 1 });
      }

    });

    // add the group of points to the root object so it will rotate with the globe.
    root.add(points);

    // add the latest tweet to the globe every so often.
    this.timer = setInterval(self.addTweet.bind(self), 500);
  }


  /**
   * Adds the next tweet in line to the globe. Called on an interval
   * so that the globe isn't overloaded with tweets/points.
   */
  addTweet() {
    // Make sure we have some tweets to work with, and a country isn't in view.
    if (tweets[this.state.numTweets] && !this.state.isCountryClicked) {
      let tweet       = tweets[this.state.numTweets],
          tweetId     = tweet['twid'],
          text        = tweet['body'],
          coordinates = tweet['coordinates']['coordinates'],
          avatarURL   = tweet['avatar'],
          screenName  = tweet['screenName'],
          sentiment   = tweet['sentiment'],
          color       = getColor(sentiment.score);

      this.setState({ numTweets: this.state.numTweets + 1 });

      // create the point and add it to our list group of points
      createPoint(coordinates[1], coordinates[0], RADIUS, 10, 20, color, points, TWEEN);

      // if there are enough tweets, move the oldest one off
      if (this.state.numTweets > 50) 
        points.children.shift();
    }
  }


	/**
	 * Used to load in the data that generates the main map/globe.
	 */
	loadMap() {

    root.scale.set(0.1, 0.1, 0.1);

    let self  = this,
        globe = createEarth(this.sphere, root, TWEEN, this.initFeed);

	  d3.json('src/json/world.json', function (err, data) {

      // Setup cache for country textures
      countries   = topojson.feature(data, data.objects.countries);
      geo         = geodecoder(countries.features);
      earth       = globe.earth;
      cloud       = globe.cloud;

      textureCache = memoize(function (cntryID, color) {
        let country = geo.find(cntryID);
        return mapTexture(country, color);
      });

	    let worldTexture     = mapTexture(countries, '#transparent', 'transparent'),
	        worldTextureBack = mapTexture(countries, '#000',         'transparent');

	    let mapMaterialBack  = new THREE.MeshPhongMaterial({
	      depthWrite:  false,
	      map:         worldTextureBack,
	      side:        THREE.BackSide,
	      transparent: true,
	    });

	    let mapMaterialFront  = new THREE.MeshPhongMaterial({
	      depthWrite:  false,
	      map:         worldTexture,
	      opacity:     0.6,
	      transparent: true,
	    });

	    let baseMapBack  = new THREE.Mesh(self.sphere, mapMaterialBack),
	        baseMapFront = new THREE.Mesh(self.sphere, mapMaterialFront);

      baseMapFront.addEventListener('mousedown',   self.onGlobeMouseDown,     false);
      baseMapFront.addEventListener('mouseup',   self.onGlobeClick,     false);
      baseMapFront.addEventListener('mousemove', self.onGlobeMousemove, false);
	    baseMapFront.receiveShadow = true;
      baseMapFront.name = "front-map";
      baseMapBack.name  = "back-map";
	    // baseMapBack.rotation.y     = Math.PI;
	    // baseMapFront.rotation.y    = Math.PI;

      // set the earth image to be above the colored globe
      earth.renderOrder = 1;

      root.rotation.y = Math.PI;

	    // make sure the back is added to the root/scene first
      root.add(earth);
      root.add(cloud);
	    root.add(baseMapBack);
	    root.add(baseMapFront);

	    scene.add(root);

	    controls = new OrbitControls( camera, renderer.domElement );

      // Setup the event listeners for the events on the globe.
      setEvents(camera, [baseMapFront], 'mousedown', null);
	    setEvents(camera, [baseMapFront], 'mouseup',   null);
      setEvents(camera, [baseMapFront], 'mousemove', 10, null, null,
        self.onCountryHoverOff.bind(self));
	    setEvents(camera, points.children, 'mousemove', 5, TWEEN,
        self.onPointHover.bind(self), self.onPointHoverOff.bind(self));

	  });

    // Load in the country data for later..
    d3.json('src/json/countries.json', function(err, data) {
      if (err) throw err;

      self.countryData = data;
    });

	}


  /**
   * Used to load in the country data (Name, Languages, Population, flag, etc);
   *
   * @param     country     :     String
   *
   */
  setCountryData(country) {
    let countryInfo = this.countryData[country];

    this.setCountryImage(countryInfo["countryCode"].toLowerCase());
    
    // Let the server know a country was clicked.
    this.socket.emit("countryChange", countryInfo );

    this.setState({
      countryFlag:       countryInfo["countryCode"].toLowerCase(),
      countryCapital:    countryInfo["capital"],
      countryPopulation: countryInfo["population"],
      countrySize:       countryInfo["areaInSqKm"],
      countryLanguages:  countryInfo["languages"]
    });
  }


  /**
   * Sets the globe material to the flag of the clicked country.
   *
   * @param     countryCode     :     String
   *
   */
  setCountryImage(countryCode) {
    let loader = new THREE.TextureLoader();

    scene.getObjectByName("cloud").material.map = loader
      .load("src/images/flags/" + countryCode + ".png");

    scene.getObjectByName("cloud").rotation.y = -Math.PI/2;
  }


  setCountryImageBack() {
    let loader = new THREE.TextureLoader();

    scene.getObjectByName("cloud").material.map = loader
      .load("src/images/clouds.png");
  }


  /*
   * Used to compute which point was hovered over and extract
   * the information from the corresponding tweet.
   *
   * @param     obj    :    THREE.Mesh
   * @param     mouse  :    Object
   *
   */
  onPointHover(obj, mouse) {
    let index = pointList.indexOf(obj),
        tweet = tweets[index];

    this.mouseCoordinates = mouse;

    // Don't show the tweets when we're in the country view mode.
    if (!this.state.isCountryClicked) {
      this.setState({ 
        isPointHovered:   true,
        tweetImage:       tweet["avatar"],
        tweetName:        tweet["author"],
        tweetText:        tweet["body"]
      }, this.onCountryHoverOff()); 
    }
  }


  /**
   * Called once a point is hovered off of. Sets the state and the object's
   * material back to what it was before.
   */
  onPointHoverOff() {
    this.setState({ isPointHovered: false });
  }


  /**
   * Called when a country is clicked on. Handles moving the globe,
   * removing the points, and setting the state.
   *
   * @param     country    :    String (name of the clicked country)
   *
   */
  onCountryClick(country) {
    root.remove(points);

    // Set the styles back to the default state.
    document.getElementById("wrapper").classList = "active";
    document.body.style.cursor = "auto";

    this.setState({
      isPointHovered: false,
      isCountryClicked: true,
      countryName: country
    }, this.setCountryData(country) );
  }


  /**
   * Handles the act of hovering on a country. Sets that country's name
   * and updates the material to show it.
   */
  onCountryHover(country) {
    document.body.style.cursor = "pointer";

    this.setState({ countryName: country });

    if (scene.getObjectByName('earth').material.opacity > 0.6) {
      overlay.material.opacity = 1;
      fadeObject(TWEEN, scene.getObjectByName('earth'), 0.6, 200);
      fadeObject(TWEEN, scene.getObjectByName('back-map'), 0.4, 200);
    }
  }


  /**
   * Handles hovering off a country. Sets the materials back.
   */
  onCountryHoverOff() {
    if (!this.state.isCountryClicked) {
      console.log("hovered off country");
      document.body.style.cursor = "auto";

      this.setState({ countryName: "" });

      if (scene.getObjectByName('earth').material.opacity < 0.99) {
        overlay.material.opacity = 0;
        fadeObject(TWEEN, scene.getObjectByName('earth'), 0.99, 200);
        fadeObject(TWEEN, scene.getObjectByName('back-map'), 1, 200);
      }
    }
  }


  /**
   * Called when the back button is clicked in the country view. Used
   * to reset the state to its original settings.
   */
  onBackButtonClick() {
    root.add(points);

    document.getElementById("wrapper").classList = "";

    // Set the cloud image back.
    this.setCountryImageBack();

    // Let the server know a country was clicked.
    this.socket.emit("countryChangeBack");

    this.setState({ 
      isCountryClicked: false,
      countryName:      "",
      numCountryTweets: 0
    });
  }


  /**
   * Called when the mouse is pressed on the globe. Sets the values
   * used to determine if the user moved the globe. 
   *
   * @param    event    :    Object
   *
   */
  onGlobeMouseDown(event) {
    this.lastPoint = parseInt(event.distance, 10);
  }


  /**
   * Checks to see if the mouse moved during a click. Compares the mouse down
   * location with the mouse up location to see.
   *
   * @param    event    :    Object
   *
   */
  isStaticClick(event) {
    return parseInt(event.distance, 10) === this.lastPoint;
  }


	/**
	 * Called when the globe is clicked on. Rotates the camera to face the
	 * globe and moves its position.
	 */
	onGlobeClick(event) {
	  // Get point, convert to latitude/longitude
	  let latlng   = getEventCenter.call(this.sphere, event),
        country  = geo.search(latlng[0], latlng[1]),
        isStatic = this.isStaticClick(event);

    // Don't do anything when a country or point is in view, or if a drag occurred.
    if (!this.state.isCountryClicked && !this.state.isPointHovered && isStatic) {
      // Make sure a country is clicked on
      if (country) {
        this.onCountryClick(country.code);
      }

  	  // Get new camera position
  	  let temp = new THREE.Mesh();
  	  temp.position.copy(convertToXYZ(latlng, 900));
  	  temp.lookAt(root.position);
  	  temp.rotateY(Math.PI);

      // Computes the temporary rotation needed to get the country in view
  	  for (let key in temp.rotation) {
  	    if (temp.rotation[key] - camera.rotation[key] > Math.PI) {
  	      temp.rotation[key] -= Math.PI * 2;
  	    } else if (camera.rotation[key] - temp.rotation[key] > Math.PI) {
  	      temp.rotation[key] += Math.PI * 2;
  	    }
  	  }

      // Move the camera to the right location in front of the clicked country.
  	  let tweenPos = getTween.call(camera, 'position', temp.position);
  	  d3.timer(tweenPos);

      // Rotate the camera after as it moves to face the globe.
      let tweenRot = getTween.call(camera, 'rotation', temp.rotation);
      d3.timer(tweenRot);

      // Set the earth's rotation back to 0 so the correct country is in view.
      let tweenRootRot = getTween.call(root, 'rotation', new THREE.Euler(0, Math.PI, 0));
      d3.timer(tweenRootRot);
    }
	}


	/**
	 * Creates and overlays a map with the hovered country highlighted.
	 * Called when the map/globe is hovered on.
	 */
	onGlobeMousemove(event) {
	  let map, material,
	      latlng  = getEventCenter.call(this.sphere, event),
	      country = geo.search(latlng[0], latlng[1]);

    // Make sure a country, is hovered on and we are not in the country view.
	  if (country && !this.state.isCountryClicked && !this.state.isPointHovered) {

      // Only run this if we have the mutex or we moved to a different country.
      if (country.code !== this.state.countryName || this.globeMutex) {

        this.globeMutex = false;

        // Overlay the selected country
        map = textureCache(country.code, 'rgba(0,0,0,0.9)');

        material = new THREE.MeshPhongMaterial({
          depthWrite:  false,
          map:         map,
          transparent: true
        });

        // Only add the overlay if it's not there already. Duh..
        if (!overlay) {
          overlay = new THREE.Mesh(this.sphere, material);
          overlay.renderOrder = 2;
          overlay.name = "overlay";
          root.add(overlay);
        } else {
          overlay.material = material;
        }

        this.onCountryHover(country.code);

      }

	  } else {

      if (!this.globeMutex) {
        this.globeMutex = true;
        // Set the pointer back if we aren't on a country
        this.onCountryHoverOff();
      }

    }
	}


	/**
	 * Loop used for rendering and updating values
	 */
	animate() {
    renderer.render(scene, camera);
    this.update();

    requestAnimationFrame(this.animate);
	}


  /**
   * Called by the animation function about 60 times per second. Updates any
   * values that are used for animation or control.
   */ 
  update() {
    if (controls && !this.state.isPointHovered) 
      controls.update();

    if (cloud && !this.state.isPointHovered) 
      cloud.rotation.y += 0.000625;

    if (root && !this.state.isPointHovered && !this.state.isCountryClicked)
      root.rotation.y += 0.0005;

    // update and transitions on existing tweens
    TWEEN.update();
  }


  componentDidMount() {
    this.init();
  }


  componentWillUnmount() {
    // remove the interval to avoid any leaks
    clearInterval(this.timer);
  }


	render() {
		return (
      <main className="body">
        <BackButton 
          isCountryClicked={this.state.isCountryClicked} 
          onButtonClick   ={this.onBackButtonClick.bind(this)} />
        <CountryName  countryName={this.state.countryName} />
  			<CountryInformation 
          countryName      ={this.state.countryName} 
          countryFlag      ={this.state.countryFlag}
          countryCapital   ={this.state.countryCapital} 
          countryPopulation={this.state.countryPopulation} 
          countrySize      ={this.state.countrySize} 
          countryLanguages ={this.state.countryLanguages}
          numCountryTweets ={this.state.numCountryTweets} />
        <TweetCount numTweets={this.state.numTweets} />
        <TweetBox 
          isPointHovered  ={this.state.isPointHovered}
          mouseCoordinates={this.mouseCoordinates}
          image           ={this.state.tweetImage}
          name            ={this.state.tweetName}
          text            ={this.state.tweetText} />
      </main>
		);
	}

}
