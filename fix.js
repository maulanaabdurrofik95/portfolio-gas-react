const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Find the index of the first </section> going backwards, then truncate and add the correct ending.
let targetStr = "              </AnimatePresence>\n            </motion.div>\n          )}\n        </section>";
let index = content.indexOf(targetStr);
if (index !== -1) {
  content = content.substring(0, index + targetStr.length);
  content += `\n      </main>\n\n      {/* Modal Overlay */}\n      <AnimatePresence>\n        {selectedPortfolio && (\n          <PortfolioModal\n            portfolio={selectedPortfolio}\n            onClose={() => setSelectedPortfolio(null)}\n          />\n        )}\n      </AnimatePresence>\n    </div>\n  );\n}`;
  fs.writeFileSync('src/pages/Home.tsx', content);
} else {
  console.log("target string not found");
}
