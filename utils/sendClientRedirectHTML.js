const sendClientRedirectHTML = (req, res, clientURL) =>
  res.send(`<html>
      <script>
        window.location.replace('${clientURL}');
        window.localStorage.setItem('accessToken', ${req.user.accessToken});
      </script>
    </html>
    `);
export default sendClientRedirectHTML;
