// chart.js
(function() {
  // 1. Ton jeu de données
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

  // 2. Fonction qui crée le SVG
  function chart() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const radius = Math.min(w, h) / 2 - 80;

    // layout radial
    const tree = d3.tree()
      .size([2 * Math.PI, radius]);

    // hiérarchie + assignation d’ID + stockage des enfants
    const root = d3.hierarchy(data);
    let idx = 0;
    root.each(d => {
      d.id = idx++;
      d._children = d.children || null;
    });

    tree(root);

    // svg responsive centré
    const svg = d3.create("svg")
      .attr("viewBox", [-w/2, -h/2, w, h])
      .style("font", "12px sans-serif")
      .style("user-select", "none");

    const g = svg.append("g");
    const linkG = g.append("g").attr("class", "links");
    const nodeG = g.append("g").attr("class", "nodes");

    const diagonal = d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y);

    // 3. update() gère enter/update/exit
    function update() {
      tree(root);

      const nodes = root.descendants();
      const links = root.links();

      // ——— Liens ———
      const link = linkG.selectAll("path.link")
        .data(links, d => d.target.id);

      link.join(
        enter => enter.append("path")
          .attr("class", "link")
          .attr("d", diagonal)
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 1.5),
        update => update.transition().duration(300).attr("d", diagonal),
        exit => exit.remove()
      );

      // ——— Noeuds ———
      const node = nodeG.selectAll("g.node")
        .data(nodes, d => d.id);

      node.join(
        enter => {
          const ng = enter.append("g")
            .attr("class", "node")
            .attr("transform", d => `
              rotate(${d.x * 180 / Math.PI - 90})
              translate(${d.y},0)
            `)
            .style("cursor", d => d._children ? "pointer" : "default")
            .on("click", (event, d) => {
              if (!d._children) return;
              // toggle children <-> _children
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
              }
              update();
            });

          // cercle
          ng.append("circle")
            .attr("r", d => d.depth === 0 ? 10 : d.depth === 1 ? 8 : 5)
            .attr("fill", d => {
              if (d.depth === 0) return "#2c3e50";
              if (d.depth === 1) return d.children ? "#28a745" : "#0074D9";
              return "#28a745";
            })
            .attr("stroke", "#333");

          // texte
          ng.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI ? 12 : -12)
            .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
            .text(d => d.data.name)
            .style("font-weight", d => d.depth <= 1 ? "bold" : "normal")
            .style("font-size", d => d.depth === 0 ? "16px" : "12px");

          return ng;
        },
        update => update.transition().duration(300)
          .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
          `),
        exit => exit.remove()
      );
    }

    update();
    return svg.node();
  }

  // 4. Rendu initial + responsive
  function render() {
    const container = document.getElementById("chart");
    container.innerHTML = "";
    container.appendChild(chart());
  }

  window.addEventListener("resize", render);
  document.addEventListener("DOMContentLoaded", render);
})();
