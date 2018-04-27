import jenkins.model.*
import hudson.markup.RawHtmlMarkupFormatter

def instance = Jenkins.instance

if(instance.markupFormatter.class != RawHtmlMarkupFormatter) {
    instance.markupFormatter = new RawHtmlMarkupFormatter(false)
    instance.save()
    println 'Markup Formatter configuration has changed.  Configured Markup Formatter.'
}
else {
    println 'Nothing changed.  Markup Formatter already configured.'
}