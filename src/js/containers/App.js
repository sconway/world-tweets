import React, { Component }                         from 'react';
import ReactDOM                                     from 'react-dom';
import { bindActionCreators }                       from 'redux';
import { connect }                                  from 'react-redux';
import * as Actions                                 from '../actions';

import { scene, camera, renderer }                  from '../common/scene';
import { setEvents }                                from '../common/setEvents';
import { convertToXYZ, getEventCenter, geodecoder } from '../common/geoHelpers';
import { mapTexture }                               from '../common/mapTexture';
import { getTween, memoize, getColor, isStaticClick,
         setCountryImage, setCountryImageBack  }    from '../common/utils';
import { fadeObject, growObject }                   from '../utils/tweens';
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
import Intro                                        from '../components/Intro';


export var tweets = [];


class App extends Component {
  constructor(props) {
    super(props);

    this.OrbitControls    = require('three-orbit-controls')(THREE);
    this.io               = require('socket.io-client');
    this.TWEEN            = require('tween.js');
    this.clock            = new THREE.Clock();
    this.cloud            = null;
    this.controls         = null;
    this.countries        = null;
    this.countryData      = null;
    this.earth            = null;
    this.geo              = null;
    this.globeMutex       = true;
    this.isCountryClicked = false;
    this.isMouseDown      = false;
    this.lastPoint        = {};
    this.mouseCoordinates = {x: 0, y: 0};  
    this.overlay          = null;
    this.points           = new THREE.Object3D();
    this.RADIUS           = 400;
    this.root             = new THREE.Object3D();
    this.segments         = 200; // number of vertices. Higher = better mouse accuracy
    this.sphere           = new THREE.SphereGeometry(this.RADIUS, this.segments, this.segments);
    this.socket           = null;
    this.textureCache     = null;
    this.timer            = null;
    this.animate          = this.animate.bind(this);
    this.initFeed         = this.initFeed.bind(this);
    this.onGlobeMouseDown = this.onGlobeMouseDown.bind(this);
    this.onGlobeMousemove = this.onGlobeMousemove.bind(this);
    this.onGlobeMouseUp   = this.onGlobeMouseUp.bind(this);
    this.onMouseDown      = this.onMouseDown.bind(this);
    this.onMouseUp        = this.onMouseUp.bind(this);
  }


	/**s
	 * Initializer function to set up our scene and all elements within it.
	 */
	init() {
    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
	  this.animate();
	  this.loadMap();
	}


  /**
   * Creates the socket connection with the server, and uses the data that
   * is sent over to create the map points, text display, etc..
   */
  initFeed() {
    let self = this;

    this.socket = this.io.connect();

    this.socket.on("connect", () => {

      // when a new tweet comes in, add it to our array
      this.socket.on("tweet", (data) => {

        if (!self.isCountryClicked) {
          tweets.push(data);
        } else {
          self.props.actions.incrementCountryTweets()
        }

      });

      // add the group of points to the root object so it will rotate with the globe.
      this.root.add(this.points);

      // add the latest tweet to the globe every so often.
      this.timer = setInterval(self.addTweet.bind(self), 500);

    });
  }


  /**
   * Adds the next tweet in line to the globe. Called on an interval
   * so that the globe isn't overloaded with tweets/points.
   */
  addTweet() {
    // Make sure we have some tweets to work with, and a country isn't in view.
    if (tweets[this.props.numTweets] && !this.isCountryClicked) {
      let tweet       = tweets[this.props.numTweets],
          tweetId     = tweet['twid'],
          text        = tweet['body'],
          coordinates = tweet['coordinates']['coordinates'],
          avatarURL   = tweet['avatar'],
          screenName  = tweet['screenName'],
          sentiment   = tweet['sentiment'],
          color       = getColor(sentiment.score);

      this.props.actions.incrementTweets();

      // create the point and add it to our list group of points
      createPoint(coordinates[1], coordinates[0], this.RADIUS, 10, 20, color, this.points, this.TWEEN);

      // if there are enough tweets, move the oldest one off
      if (this.props.numTweets > 50) 
        this.points.children.shift();
    }
  }


	/**
	 * Used to load in the data that generates the main map/globe.
	 */
	loadMap() {
    let self  = this,
        globe = createEarth(this.sphere);

	  d3.json('src/json/world.json', (err, data) => {

      // Setup cache for country textures
      this.countries    = topojson.feature(data, data.objects.countries);
      this.geo          = geodecoder(this.countries.features);
      this.earth        = globe.earth;
      this.cloud        = globe.cloud;
      this.textureCache = memoize((cntryID, color) => {
        let country = this.geo.find(cntryID);
        return mapTexture(country, color);
      });

	    let worldTexture     = mapTexture(this.countries, '#transparent', 'transparent'),
	        worldTextureBack = mapTexture(this.countries, '#111111', 'transparent');

	    let mapMaterialBack  = new THREE.MeshPhongMaterial({
	      depthWrite:  false,
        color:       0x111111,
        emissive:    0x3c2711,
        shininess:   50,
	      map:         worldTextureBack,
	      side:        THREE.BackSide,
	      transparent: true
	    });

	    let mapMaterialFront = new THREE.MeshPhongMaterial({
	      depthWrite:  false,
	      map:         worldTexture,
	      opacity:     0.6,
	      transparent: true,
	    });

	    let baseMapBack  = new THREE.Mesh(self.sphere, mapMaterialBack),
	        baseMapFront = new THREE.Mesh(self.sphere, mapMaterialFront);

      // Add the event listeners and name 
      baseMapFront.addEventListener('mousedown', self.onGlobeMouseDown, false);
      baseMapFront.addEventListener('mouseup',   self.onGlobeMouseUp,     false);
      baseMapFront.addEventListener('mousemove', self.onGlobeMousemove, false);
	    baseMapFront.receiveShadow = true;
      baseMapFront.name = "front-map";
      baseMapBack.name  = "back-map";

      // set the earth image to be above the colored globe
      this.earth.renderOrder = 1;
      this.cloud.renderOrder = 2;

      // make sure the back is added to the root/scene first
      this.root.add(this.cloud);
      this.root.add(this.earth);
      this.root.add(baseMapBack);
      this.root.add(baseMapFront);
      this.root.scale.set(0.1, 0.1, 0.1);
      this.root.rotation.y = Math.PI;
	    scene.add(this.root);

      // Add controls for the scene.
	    this.controls = new this.OrbitControls(camera, renderer.domElement);
      this.controls.minDistance = 500;
      this.controls.maxDistance = 1000;

      // Registers the event listeners for the events on the globe.
      setEvents(camera, [baseMapFront], 'mousedown', null);
	    setEvents(camera, [baseMapFront], 'mouseup',   null);
      setEvents(camera, [baseMapFront], 'mousemove', 5, null, null,
        self.onCountryHoverOff.bind(self));
	    setEvents(camera, this.points.children, 'mousemove', 5, this.TWEEN,
        self.onPointHover.bind(self), self.onPointHoverOff.bind(self));

	  });

    // Load in the country data for later..
    d3.json('src/json/countries.json', (err, data) => {
      if (err) throw err;

      self.countryData = data;
    });

	}


  /**
   * Called when the intro button is clicked. Kicks off the animation.
   */
  onReady() {
    this.props.actions.setSceneLoaded();
    growObject(this.TWEEN, this.root, 1, 2000, 500, this.initFeed.bind(this));
  }


  /**
   * Used to load in the country data (Name, Languages, Population, flag, etc);
   *
   * @param     country     :     String
   *
   */
  setCountryData(country) {
    let countryInfo = this.countryData[country],
        countryData = {
          flag:       countryInfo["countryCode"].toLowerCase(),
          capital:    countryInfo["capital"],
          population: countryInfo["population"],
          size:       countryInfo["areaInSqKm"],
          languages:  countryInfo["languages"]
        };

    // Show the selected country's flag
    setCountryImage(countryInfo["countryCode"].toLowerCase());
    this.props.actions.setCountryData(countryData);
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
        tweet = tweets[index],
        data  = {
          image: tweet["avatar"],
          name:  tweet["author"],
          text:  tweet["body"]
        };

    this.mouseCoordinates = mouse;

    // Don't show the tweets when we're in the country view mode, or dragging.
    if (!this.isCountryClicked && !this.isMouseDown) {
      this.props.actions.setPointHovered(true);
      this.props.actions.setPointTweetData(data);
      this.toggleGlobeVisibility(0, 0.6, 0.4);
      this.onCountryHoverOff();
    }
  }


  /**
   * Called once a point is hovered off of. Sets the state and the object's
   * material back to what it was before.
   */
  onPointHoverOff() {
    this.props.actions.setPointHovered(false);
    this.toggleGlobeVisibility(0, 0.99, 1);
  }


  /**
   * Called when a country is clicked on. Handles moving the globe,
   * removing the points, and setting the state.
   *
   * @param     country    :    String (name of the clicked country)
   *
   */
  onCountryClick(country) {
    this.root.remove(this.points);

    // Set the styles back to the default state.
    document.getElementById("wrapper").classList.add("active");
    document.body.classList.remove("pointer");

    this.isCountryClicked = true;

    this.props.actions.setPointHovered(false);
    this.props.actions.setCountryName(country);
    this.setCountryData(country);
  }


  /**
   * Handles the act of hovering on a country. Sets that country's name
   * and updates the material to show it.
   *
   * @param      country     :     Number
   *
   */
  onCountryHover(country) {
    document.body.classList.add("pointer");
    this.props.actions.setCountryName(country)
    this.toggleGlobeVisibility(1, 0.6, 0.4);
  }


  /**
   * Handles hovering off a country. Sets the materials, cursor, and
   * country back to the default values.
   */
  onCountryHoverOff() {

    if (!this.isCountryClicked) {
      document.body.classList.remove("pointer");

      this.props.actions.setCountryName("");

      if (!this.props.isPointHovered)
        this.toggleGlobeVisibility(0, 0.99, 1);
    }
    
  }


  /**
   * Called when the back button is clicked in the country view. Used
   * to reset the state to its original settings.
   */
  onBackButtonClick() {
    this.root.add(this.points);

    document.getElementById("wrapper").classList.remove("active");

    setCountryImageBack();

    this.isCountryClicked = false;

    this.props.actions.setCountryName("");
    this.props.actions.resetCountryTweets();

    // reset globe visibility to default state.
    this.onCountryHoverOff();
  }


  /**
   * Used to decrease/increase the earth and back map's opacity depending 
   * on whether or not a country is hovered on.
   *
   * @param      materialOpacity     :     number
   * @param      earthOpacity        :     number
   * @param      mapOpacity          :     number
   */
  toggleGlobeVisibility(materialOpacity, earthOpacity, mapOpacity) {

    if ((scene.getObjectByName('earth').material.opacity !== earthOpacity) &&
        !this.isCountryClicked) {

      // Make sure an overlay has been defined before we set its opacity.      
      if (this.overlay) this.overlay.material.opacity = materialOpacity;

      scene.getObjectByName('earth').material.opacity = earthOpacity;      
      scene.getObjectByName('back-map').material.opacity = mapOpacity;      
    }
    
  }  


  /**
   * Called anytime the mouse is pressed down. Sets the flag
   * used to determine if dragging is occurring.
   */
  onMouseDown() {
    this.isMouseDown = true;
  }


  /**
   * Called anytime the mouse is pressed up. Sets the flag
   * used to determine if dragging is occurring.
   */
  onMouseUp() {
    this.isMouseDown = false;
  }


  /**
   * Called when the mouse is pressed on the globe. Sets the values
   * used to determine if the user moved the globe. 
   *
   * @param    event    :    Object
   *
   */
  onGlobeMouseDown(event) {
    this.isMouseDown = true;
    this.lastPoint = parseInt(event.distance, 10);
  }


	/**
	 * Called when the globe is clicked on. Rotates the camera to face the
	 * globe and moves its position.
	 */
	onGlobeMouseUp(event) {
	  // Get point, convert to latitude/longitude
	  let latlng   = getEventCenter.call(this.sphere, event),
        country  = this.geo.search(latlng[0], latlng[1]),
        isStatic = isStaticClick(event, this.lastPoint);

    this.isMouseDown = false;

    // Don't do anything when a country or point is in view, or if a drag occurred.
    if (!this.isCountryClicked && !this.props.isPointHovered && isStatic) {

      // Make sure a country is clicked on
      if (country)
        this.onCountryClick(country.code);

  	  // Get new camera position
  	  let temp = new THREE.Mesh();
  	  temp.position.copy(convertToXYZ(latlng, 900));
  	  temp.lookAt(this.root.position);
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
      let tweenRootRot = getTween.call(this.root, 'rotation', new THREE.Euler(0, Math.PI, 0));
      d3.timer(tweenRootRot);
    }
	}


	/**
	 * Creates and overlays a map with the hovered country highlighted.
	 * Called when the map/globe is hovered on.
   *
   * @param     event     :     Object
   *
	 */
	onGlobeMousemove(event) {
	  let map, material,
	      latlng  = getEventCenter.call(this.sphere, event),
	      country = this.geo.search(latlng[0], latlng[1]);

    // Make sure a country, is hovered on and we are not in the country view.
	  if (country && !this.isCountryClicked && !this.props.isPointHovered && !this.isMouseDown)  {

      // Only run this if we have the mutex or we moved to a different country.
      if (country.code !== this.props.countryName || this.globeMutex) {

        this.globeMutex = false;

        // Overlay the selected country
        map = this.textureCache(country.code, 'rgba(0,0,0,0.9)');

        material = new THREE.MeshPhongMaterial({
          depthWrite:  false,
          map:         map,
          transparent: true
        });

        // Only add the overlay if it's not there already. Duh..
        if (!this.overlay) {
          this.overlay = new THREE.Mesh(this.sphere, material);
          this.overlay.renderOrder = 3;
          this.overlay.name = "overlay";
          this.root.add(this.overlay);
        } else {
          this.overlay.material = material;
        }

        this.onCountryHover(country.code);

      }

	  } else {

      // Only call this once
      if (!this.globeMutex) {
        this.globeMutex = true;

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
    if (this.controls && !this.props.isPointHovered) 
      this.controls.update();

    if (this.cloud && !this.props.isPointHovered) 
      this.cloud.rotation.y += 0.000625;

    if (this.root && !this.props.isPointHovered && !this.isCountryClicked)
      this.root.rotation.y += 0.0005;

    // update and transitions on existing tweens
    this.TWEEN.update();
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
        <Intro 
          isLoaded   ={this.props.isLoaded}
          handleClick={this.onReady.bind(this)} />
        <BackButton 
          isCountryClicked={this.isCountryClicked} 
          onButtonClick   ={this.onBackButtonClick.bind(this)} />
        <CountryName  
          countryName={this.props.countryName} />
  			<CountryInformation 
          countryName      ={this.props.countryName} 
          countryFlag      ={this.props.countryFlag}
          countryCapital   ={this.props.countryCapital} 
          countryPopulation={this.props.countryPopulation} 
          countrySize      ={this.props.countrySize} 
          countryLanguages ={this.props.countryLanguages}
          numCountryTweets ={this.props.numCountryTweets} />
        <TweetCount 
          numTweets={this.props.numTweets} />
        <TweetBox 
          isPointHovered  ={this.props.isPointHovered}
          mouseCoordinates={this.mouseCoordinates}
          image           ={this.props.tweetImage}
          name            ={this.props.tweetName}
          text            ={this.props.tweetText} />
      </main>
		);
	}
}


/**
 * Maps state(result of our reducers) to the defined props.
 * Allows this container to be aware of the store.
 */
const mapStateToProps = (state) => {
  return {
    countryName:       state.globe.countryName,
    countryFlag:       state.globe.countryFlag,
    countryCapital:    state.globe.countryCapital,
    countryPopulation: state.globe.countryPopulation,
    countrySize:       state.globe.countrySize,
    countryLanguages:  state.globe.countryLanguages,
    numTweets:         state.tweet.numTweets,
    numCountryTweets:  state.tweet.numCountryTweets,
    isLoaded:          state.globe.isLoaded,
    isPointHovered:    state.globe.isPointHovered,
    isCountryClicked:  state.globe.isCountryClicked,
    tweetImage:        state.tweet.tweetImage,
    tweetName:         state.tweet.tweetName,
    tweetText:         state.tweet.tweetText
  };
}


/**
 * Allows this container to inform the store that it needs to be updated.
 * Gives us access to the action creators via props.
 */
const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

// Give child components access to these props.
export default connect(mapStateToProps, mapDispatchToProps)(App);
