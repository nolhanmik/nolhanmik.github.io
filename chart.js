const data = {
  name: "LE REFERENTIEL DD&RS",
  children: [
    {
      name: "1. Stratégie & Gouvernance",
      children: [
        { name: "1.1 Formaliser sa politique DD&RS" },
        { name: "1.2 Déployer des ressources" },
        { name: "1.3 Société responsable" }
      ]
    },
    {
      name: "2. Enseignement & Formation",
      children: [
        { name: "2.1 Intégrer le DD&RS" },
        { name: "2.2 Développer les compétences" },
        { name: "2.3 Soutenir les enseignant.es" },
        { name: "2.4 Société de la connaissance" }
      ]
    },
    {
      name: "3. Recherche & Innovation",
      children: [
        { name: "3.1 Stratégie R&I" },
        { name: "3.2 Science/société" },
        { name: "3.3 Réflexion éthique" }
      ]
    },
    {
      name: "4. Gestion environnementale",
      children: [
        { name: "4.1 Émissions & ressources" },
        { name: "4.2 Pollution" },
        { name: "4.3 Biodiversité" },
        { name: "4.4 Alimentation responsable" }
      ]
    },
    {
      name: "5. Politique sociale",
      children: [
        { name: "5.1 Égalité & diversité" },
        { name: "5.2 Compétences DD&RS" },
        { name: "5.3 Qualité de vie" },
        { name: "5.4 Égalité des chances" }
      ]
    }
  ]
};

function chart() {
  const radius = Math.min(window.innerWidth, window.innerHeight) / 2 - 100;
  const tree = d3.tree().size([2 * Math.PI, radius]);
  const root = d3.hierarchy(data);
  root.x0 = Math.PI;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth > 1) d.children = null; // Seuls les niveaux > 1 sont repliables
  });

  tree(root);

  const svg = d3.create("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .attr("style", "font: 12px sans-serif; user-select: none;");

  const g = svg.append("g")
    .attr("transform", `translate(${window.innerWidth / 2},${window.innerHeight / 2})`);

  const diagonal = d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y);

  function update(source) {
  tree(root); // recalculer la mise en page

  const nodes = root.descendants();
  const links = root.links();

  g.selectAll(".link").remove();
  g.selectAll(".node").remove();

  g.selectAll(".link")
    .data(links)
    .enter().append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#999")
    .attr("stroke-width", 1.5)
    .attr("d", diagonal);

  const node = g.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `
      rotate(${(d.x * 180 / Math.PI - 90)})
      translate(${d.y},0)
    `)
    .on("click", (event, d) => {
      if (d.depth > 1 && d._children) {
        d.children = d.children ? null : d._children;
        update(d);
      }
    });

  node.append("circle")
    .attr("r", 5)
    .attr("fill", d => d.depth === 0 ? "#2c3e50" : d.depth === 1 ? "#0074D9" : "#28a745");

  node.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.x < Math.PI ? 6 : -6)
    .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
    .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
    .text(d => d.data.name)
    .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
    .style("font-size", d => d.depth === 0 ? "16px" : "12px");
}

 

  update(root);

  return svg.node();
}

document.getElementById("chart").appendChild(chart());

window.addEventListener("resize", () => {
  document.getElementById("chart").innerHTML = "";
  document.getElementById("chart").appendChild(chart());
});
