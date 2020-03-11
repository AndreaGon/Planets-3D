define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		//Initialize everything
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		var renderer = new THREE.WebGLRenderer();

		var planetNames = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
		var homeDisplay = document.getElementById("planets-list");
		var planetDisplay = document.getElementById("planet-display");
		var isPlanet = false;

		//Allow interaction with planet
		var controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.target.set(0,0,0);

		for (var i = 0; i < 8; i ++){
			var planetList = document.createElement('div');
			planetList.id = 'planet-' + planetNames[i];
			planetList.className = 'planets';
			homeDisplay.appendChild(planetList);

			var planetImage = document.createElement('img');
			planetImage.className = planetNames[i];
			planetImage.src = "images/" + planetNames[i] + ".jpg";
			planetImage.width = 250;
			document.getElementById("planet-" + planetNames[i]).appendChild(planetImage);

			showPlanet(planetNames[i]);
		}

		//Show planet function
		function showPlanet(currPlanetName){
			var url = "images/" + currPlanetName + "map.jpg";
			var bumpUrl = "images/" + currPlanetName + "bump.jpg";
			var specUrl = "images/" + currPlanetName + "spec.jpg";
			var cloudUrl = "images/" + currPlanetName + "cloudmap.jpg";
			var ringUrl = "images/" + currPlanetName + "ringcolor.jpg";

			//Create Planet
			var loadTexture = new THREE.TextureLoader().load(url);
			var geometry = new THREE.SphereGeometry(2, 32, 32);
			var material = new THREE.MeshPhongMaterial({map: loadTexture});
			var planetMesh = new THREE.Mesh(geometry, material);

			//Create clouds for Earth
			var loadCloudTexture = new THREE.TextureLoader().load(cloudUrl);
			var light = new THREE.DirectionalLight(0xffffff);
			var cloudGeometry = new THREE.SphereGeometry(2.03, 32, 32);
			var cloudMaterial = new THREE.MeshPhongMaterial({
				map: loadCloudTexture,
				side: THREE.DoubleSide,
				opacity: 0.2,
				transparent: true,
				depthWrite: false
			});
			var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
			planetMesh.add(cloudMesh);

			//Create Rings
			var loadRingTexture = new THREE.TextureLoader().load(ringUrl);
			var light = new THREE.DirectionalLight(0xffffff);
			var ringGeometry = new THREE.RingBufferGeometry(2.5, 5, 25);
			var position = ringGeometry.attributes.position;
			var vector = new THREE.Vector3();
			for (let i = 0; i < position.count; i++){
				vector.fromBufferAttribute(position, i);
				ringGeometry.attributes.uv.setXY(i, vector.length() < 4 ? 0 : 1, 1);
			}
			var ringMaterial = new THREE.MeshPhongMaterial({
				map: loadRingTexture,
				side: THREE.DoubleSide,
				opacity: 0.6,
				transparent: true,
				depthWrite: true
			});
			var ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);


			//For planets with terrain, add bumps
			material.bumpMap = new THREE.TextureLoader().load(bumpUrl);
			material.specularMap = new THREE.TextureLoader().load(specUrl);
			material.specular  = new THREE.Color('grey')
			material.bumpScale = 0.05;

			//When click on a planet, show more info about that planet
			document.getElementById("planet-" + currPlanetName).addEventListener("click", function(){
				planetDisplay.style.width = "100%";
				planetDisplay.style.height = "100%";
				homeDisplay.style.display = "none";

				renderer.setSize( window.innerWidth, window.innerHeight);
				planetDisplay.appendChild(renderer.domElement);
				light.position.set( 1, 1, 3 ).normalize();
				scene.add(light);

				console.log(currPlanetName);

				scene.add(planetMesh);
				scene.add(camera);
				if (currPlanetName === "saturn"){
					ringMesh.rotation.x = 33;
					scene.add(ringMesh);
				}
				camera.position.z = 5;

				function resizePlanet() {
			    var width = planetDisplay.clientWidth;
			    var height = planetDisplay.clientHeight;

			    renderer.setSize(width, height);
			    camera.aspect = width/height;
			    controls.handleResize();
				}

				function animatePlanet() {
			    requestAnimationFrame(animatePlanet);
			    planetMesh.rotation.y += 0.1 * Math.PI/180;
			    controls.update();
			    renderer.render(scene, camera);
				}

				resizePlanet();
				animatePlanet();
			});

			document.getElementById("home-button").addEventListener("click", function(){
				planetDisplay.style.width = "0%";
				planetDisplay.style.height = "0%";
				homeDisplay.style.display = "block";

				//Remove previous scene
				while(scene.children.length > 0){
				   scene.remove(scene.children[0]);
				}
			});

		}


	});

});
