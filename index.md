---
title: ng-hyper
layout: default
---

# ng-hyper

[hyper-json](hyper-json.hypergroup.io) tools for angular

## Examples

<div class="examples" data-ng-app="ng-hyper-example">
{% for example in site.data.examples %}
<div class="example">

<div class="markup" data-ng-non-bindable="">
{% highlight html %}
{% include {{example.html}} %}
{% endhighlight %}
</div>

<div class="api">
{% highlight json %}
{% include {{example.api}} %}
{% endhighlight %}
</div>

<div class="app">
{% include {{example.html}} %}
</div>

</div>
{% endfor %}
</div>

<script src="http://code.angularjs.org/1.2.8/angular.min.js"></script>
<script src="js/example.js"></script>
