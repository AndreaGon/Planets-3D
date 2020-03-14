define(["sugar-web/activity/activity"], function (activity) {

	// Manipulate the DOM only when it is ready.
	requirejs(['domReady!'], function (doc) {

		// Initialize the activity.
		activity.setup();

		//Initialize 3D Scene and Camera
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		var renderer = new THREE.WebGLRenderer();

		//Planet Information
		var infoType = ["Name", "Type", "Year", "Mass", "Temperature", "Moons"];
		var planetNames = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
		var planetType;
		var planetMoon = [0, 0, 1, 2, 79, 83, 27, 14];
		var planetMass = [
			"330,104,000,000,000,000,000,000 kg",
			"4,867,320,000,000,000,000,000,000 kg",
			"5,972,190,000,000,000,000,000,000 kg",
			"641,693,000,000,000,000,000,000 kg",
			"1,898,130,000,000,000,000,000,000,000 kg",
			"568,319,000,000,000,000,000,000,000 kg",
			"86,810,300,000,000,000,000,000,000 kg",
			"102,410,000,000,000,000,000,000,000 kg",
		];
		var planetYear = [88, 225, 365, 687, 4333, 10759, 30687, 60190];
		var planetTemperature = ["-173 to 427&#176;C", "462&#176;C", "-88 to 58&#176;C", "-153 to 20&#176;C"];



		var homeDisplay = document.getElementById("planets-list");
		var interactContainer = document.getElementById("planet-container");
		var planetDisplay = document.getElementById("planet-display");
		var planetInfo = document.getElementById("planet-info");
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

			showPlanet(planetNames[i], planetYear[i], planetMass[i], planetTemperature[i], planetMoon[i]);
		}

		//Show planet function
		function showPlanet(name, year, mass, temperature, moons){

			//Url of image files
			var url = "images/" + name + "map.jpg";
			var bumpUrl = "images/" + name + "bump.png";
			var specUrl = "images/" + name + "spec.png";
			var cloudUrl = "images/" + name + "cloudmap.jpg";
			var ringUrl = "images/" + name + "ringcolor.jpg";

			//Create Planet
			var loadTexture = new THREE.TextureLoader().load(url);
			var geometry = new THREE.SphereGeometry(2, 32, 32);
			var material = new THREE.MeshPhongMaterial({map: loadTexture});
			var planetMesh = new THREE.Mesh(geometry, material);

			//Create clouds for Earth
			var loadCloudTexture = new THREE.TextureLoader().load(cloudUrl);
			var light = new THREE.DirectionalLight(0xffffff);
			var lightHolder = new THREE.Group();
			var cloudGeometry = new THREE.SphereGeometry(2.03, 32, 32);
			var cloudMaterial = new THREE.MeshPhongMaterial({
				map: loadCloudTexture,
				side: THREE.DoubleSide,
				opacity: 0.5,
				transparent: true,
				depthWrite: false
			});
			var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
			planetMesh.add(cloudMesh);

			//Create Rings
			var loadRingTexture = new THREE.TextureLoader().load(ringUrl);
			var ringGeometry = new THREE.RingBufferGeometry(2.5, 5, 40);
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
			material.bumpScale = 0.1;

			//When click on a planet, show more info about that planet
			document.getElementById("planet-" + name).addEventListener("click", function(){
				interactContainer.style.width = "100%";
				interactContainer.style.height = "100%";
				homeDisplay.style.display = "none";

				renderer.setSize( planetDisplay.clientWidth, window.innerHeight);
				planetDisplay.appendChild(renderer.domElement);
				light.position.set( 1, 1, 5 );

				lightHolder.add(light);
				scene.add(lightHolder);

				console.log(name);

				scene.add(planetMesh);
				scene.add(camera);

				if (name === "Saturn"){
					ringMesh.rotation.x = 33;
					scene.add(ringMesh);
				}

				camera.position.z = 5;

				function resizePlanet() {

					var width = planetDisplay.clientWidth;
					var height = planetDisplay.clientHeight;

					renderer.setSize(width, height);
					camera.aspect = width/height;
					camera.updateProjectionMatrix();
					controls.handleResize();

				}

				function animatePlanet() {
			    requestAnimationFrame(animatePlanet);
			    planetMesh.rotation.y += 0.1 * Math.PI/180;
			    controls.update();
					lightHolder.quaternion.copy(camera.quaternion);
			    renderer.render(scene, camera);
				}


				resizePlanet();
				animatePlanet();

				for (var i = 0; i < 6; i++){
					var information = document.createElement('div');
					information.id = infoType[i];
					information.className = 'info';
					planetInfo.appendChild(information);

				}

				var terrestrial = name === "Mercury" || name === "Venus" || name === "Earth" || name === "Mars";
				var gasgiant = name === "Jupiter" || name === "Saturn";
				var icegiant = name === "Uranus" || name === "Neptune";

				if (terrestrial){
					planetType = "Terrestrial";
				} else if (gasgiant) {
					planetType = "Gas Giant";
				} else if (icegiant) {
					planetType = "Ice Giant";
				}

				if (temperature === undefined){
					temperature = "No Data";
				}

				document.getElementById("Name").innerHTML = '<p>' + "Planet Name: " + '</br>' + name + '</p>';
				document.getElementById("Type").innerHTML = '<p>' + "Planet Type: " + '</br>' + planetType + '</p>';
				document.getElementById("Year").innerHTML = '<p>' + "Length of Year: " + '</br>' + year + " Earth Days" + '</p>';
				document.getElementById("Mass").innerHTML = '<p>' + "Mass: " + '</br>' + mass + '</p>';
				document.getElementById("Temperature").innerHTML = '<p>' + "Surface Temperature: " + '</br>' + temperature + '</p>';
				document.getElementById("Moons").innerHTML = '<p>' + "Number of Moons: " + '</br>' + moons + '</p>';
			});

			document.getElementById("home-button").addEventListener("click", function(){
				interactContainer.style.width = "0%";
				interactContainer.style.height = "0%";
				homeDisplay.style.display = "block";

				//Remove previous scene
				while(scene.children.length > 0){
				   scene.remove(scene.children[0]);
				}

				document.getElementById("Name").innerHTML = "";
				document.getElementById("Year").innerHTML = "";
			});

		}


	});

});
