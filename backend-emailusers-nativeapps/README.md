<h1>Color Palette APP </h1>
<p>Its an Native APP created to help me select colors when designing. Bear in mind that as a colorblind, I am not good with mixin colors.</p>
<hr />

<hr>

<h2>For more information</h2>
<p>Please feel free to contact me by email. josejaviersanahuja@gmail.com</p>

<hr>

<h2>This Backend was created using My own template</h2>
<p> Here you can find my template <a href="https://github.com/josejaviersanahuja/api-templates" target="_blank" rel="no referrer">https://github.com/josejaviersanahuja/api-templates</a></p>

<hr>

<h2>How to customize the template for a native APP.</h2>
<ol>
  <li>
    .env: Its the first file to customize, without it, the app won´t run.
    <ol>
      <li>MongoDB_URI</li>
      <li>MongoDB_TEST_URI</li>
      <li>HASHING_SECRET</li>
      <li>ADMIN_EMAIL</li>
      <li>ADMIN_EMAIL_PASSWORD</li>
    </ol>
  </li>
  <li>README.md: To show the information of this APP.</li>
  <li>config.js: Replace the appName and the baseUrl when deployed.</li>
  <li>We add images and statics to serve at the Home Page. Logo for Colors-Palette App  ie.</li>
  <li>
    Mongoose Model: 
    <ol>
      <li>usersSchema: I removed the condition of Unique userName.</li>
      <li>tokensSchema: I removed the the whole key <b>expired</b>. As a Native APP, Having a none expiring token, makes sense.</li>
      <li>As consequence, I must touch most of the logics of my endpoints.</li>
    </ol>
  </li>
  <li>Delete the only lib/workers.js implemented as there's no need to clean expired tokens. Consequence, when retouching the endpoints I must check how to deal with new logins</li>
  <li>Delete the lines in bin/www that imported and executed the workers</li>
  <li>Endpoints modified</li>
  <li>TODO -- HOME TEMPLATE and VALIDATED TEMPLATE</li>
</ol>