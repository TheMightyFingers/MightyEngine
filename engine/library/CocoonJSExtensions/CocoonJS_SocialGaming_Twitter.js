(function()
{
    // The CocoonJS must exist before creating the extension.
    if (typeof window.CocoonJS === 'undefined' || window.CocoonJS === null) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (typeof window.CocoonJS.SocialGaming === 'undefined' || window.CocoonJS === null) throw("The CocoonJS.SocialGaming object must exist and be valid before creating a Twitter extension.");

	/**
	* This instance represents the extension object to access Facebook related native functionalities.
	* @see CocoonJS.Social
	*/
	// CocoonJS.Social.Twitter = new CocoonJS.Social("IDTK_SRV_TWITTER", "Social.Twitter");

})();