var _ = require('lodash');
var path = require('path');
var prevnextPlugin = require('antwar-prevnext-plugin');
var markdown = require('./src/utilities/markdown');
var highlight = require('./src/utilities/highlight');

module.exports = {
  template: {
    title: 'webpack',
    description: 'webpack 是一个模块打包器。它的主要目标是将 JavaScript 文件打包在一起，打包后的文件用于在浏览器中使用，但它也能够胜任转换(transform)、打包(bundle)或包裹(package)任何资源(resource or asset)。',
    file: path.join(__dirname, 'template.ejs')
  },
  output: 'build',
  title: 'webpack',
  keywords: ['webpack', 'javascript', 'web development', 'programming'],
  pageTitle: function(config, pageTitle) {
    var siteName = config.name;

    if (pageTitle === 'index') {
      return siteName;
    }

    return siteName + ' - ' + pageTitle;
  },
  plugins: [
    prevnextPlugin()
  ],
  layout: function() {
    return require('./src/components/Site/Site.jsx').default
  },
  paths: {
    '/': root(
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content',
          false,
          /^\.\/.*\.md$/
        );
      }
    ),

    'get-started': {
      redirects: {
        '': '/guides/getting-started',
        'install-webpack': '/guides/installation',
        'why-webpack': '/guides/why-webpack',
      }
    },

    concepts: section(
      '概念',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/concepts',
          false,
          /^\.\/.*\.md$/
        );
      }
    ),

    guides: section(
      '指南',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/guides',
          true,
          /^\.\/.*\.md$/
        );
      }, {
        'code-splitting-import': '/guides/code-splitting',
        'code-splitting-require': '/guides/code-splitting',
        'code-splitting-async': '/guides/code-splitting',
        'code-splitting-css': '/guides/code-splitting',
        'code-splitting-libraries': '/guides/code-splitting',
        'why-webpack': '/guides/comparison',
        'production-build': '/guides/production'
      }
    ),

    'guides/starter-kits': {
      title: '起步配套工具',
      path() {
        return require('./src/components/StarterKits/StarterKits.jsx').default;
      }
    },

    development: section(
      '开发',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/development',
          true,
          /^\.\/.*\.md$/
        );
      }
    ),

    configuration: section(
      '配置',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/configuration',
          false,
          /^\.\/.*\.md$/
        );
      }, {
        'external-configs': 'javascript-alternatives'
      }
    ),

    api: section(
      'API',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/api',
          false,
          /^\.\/.*\.md$/
        );
      }, {
        'passing-a-config': 'configuration-types'
      }
    ),

    'api/plugins': section(
      'API',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/api/plugins',
          false,
          /^\.\/.*\.md$/
        );
      }
    ),

    pluginsapi: {
      redirects: {
        '': '/api/plugins',
        'compiler': '/api/plugins/compiler',
        'template': '/api/plugins/template'
      }
    },

    loaders: section(
      'Loaders',
      function() {
        const content = require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/loaders',
          false,
          /^\.\/.*\.md$/
        );
        const generated = require.context(
          'json-loader!yaml-frontmatter-loader!./generated/loaders',
          false,
          /^\.\/.*\.md$/
        );
        return combineContexts(content, generated);
      }
    ),

    plugins: section(
      'Plugins',
      function() {
        const content = require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/plugins',
          false,
          /^\.\/.*\.md$/
        );
        const generated = require.context(
          'json-loader!yaml-frontmatter-loader!./generated/plugins',
          false,
          /^\.\/.*\.md$/
        );
        return combineContexts(content, generated);
      }
    ),

    support: section(
      '支持',
      function() {
        return require.context(
          'json-loader!yaml-frontmatter-loader!./src/content/support',
          false,
          /^\.\/.*\.md$/
        );
      }
    ),

    vote: {
      path() {
        return require('./src/components/Vote/List.jsx').default
      }
    },

    'vote/feedback': {
      path() {
        return require('./src/components/Vote/List.jsx').default
      }
    },

    'vote/moneyDistribution': {
      path() {
        return require('./src/components/Vote/List.jsx').default
      }
    },

    organization: {
      path() {
        return require('./src/components/Organization/Organization.jsx').default
      }
    }
  }
};

function root(contentCb) {
  return {
    title: 'webpack',
    path: function() { // Load path content
      return contentCb();
    },
    processPage: processPage(), // Process individual page (url, content)
    layouts: { // Layouts (page/section)
      index: function() {
        return require('./src/components/Splash/Splash.jsx').default
      },
      page: function() {
        return require('./src/components/Page/Page.jsx').default
      }
    },
    redirects: {} // Redirects <from>: <to>
  };
}

function section(title, contentCb, redirects = {}) {
  return {
    title: title,
    path: function() {
      return contentCb();
    },
    sort(pages) {
      return _.sortBy(pages, (page) => page.file.sort)
    },
    processPage: processPage(),
    layouts: {
      index: function() {
        return require('./src/components/Page/Page.jsx').default
      },
      page: function() {
        return require('./src/components/Page/Page.jsx').default
      }
    },
    redirects: redirects // <from>: <to>
  };
}

function processPage() {
  return {
    url: function(o) {
      return o.sectionName + '/' + o.fileName.split('.')[0]
    },
    content: function(o) {
      return markdown().process(o.file.__content, highlight);
    },
    anchors: function(o) {
      return markdown().getAnchors(o.file.__content);
    },
    contributors: function(o) {
      return Array.isArray(o.file.contributors) && o.file.contributors.length && o.file.contributors.slice().sort();
    },
    related: function(o) {
      return Array.isArray(o.file.related) ? o.file.related : []
    }
  };
}

function combineContexts(context1, context2) {
  function webpackContext(req) {
    try {
      return context1(req);
    } catch (e) {
      return context2(req);
    }
  }
  webpackContext.keys = () => {
    "use strict";

    let keys1 = context1.keys();
    let keys2 = context2.keys();
    return _.chain(keys1).concat(keys2).sortBy().uniq().value();
  };
  return webpackContext;
}
